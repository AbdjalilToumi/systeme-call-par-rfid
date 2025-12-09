#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>
#include <ESP8266HTTPClient.h> 
#include <NTPClient.h>
#include <WiFiUdp.h>

// --- CONFIGURATION WI-FI ---
const char* ssid = "HUAWEI-2.4G-96As"; 
const char* password = "CNcnKK28"; 


WebSocketsServer webSocket = WebSocketsServer(81); 
WiFiUDP ntpUDP;
// Décalage de 1 heure (3600 secondes) pour le fuseau horaire de l'Europe/Maroc
NTPClient timeClient(ntpUDP, "pool.ntp.org", 3600, 60000); 

// --- VARIABLES GLOBALES ---
String lastPayload = ""; 

// --- FONCTION UTILITAIRE : OBTENIR LE TEMPS ---
String getTime() {
  timeClient.update();
  unsigned long epochTime = timeClient.getEpochTime();
  
  struct tm *ptm = gmtime ((time_t *)&epochTime); 
  
  int monthDay = ptm->tm_mday;
  int currentMonth = ptm->tm_mon+1;
  int currentYear = ptm->tm_year+1900;
  int currentHour = ptm->tm_hour;
  int currentMinute = ptm->tm_min;
  int currentSecond = ptm->tm_sec;

  // Format YYYY-MM-DD HH:MM:SS
  String timeString = String(currentYear) + "-" + 
                      (currentMonth < 10 ? "0" : "") + String(currentMonth) + "-" + 
                      (monthDay < 10 ? "0" : "") + String(monthDay) + " " + 
                      (currentHour < 10 ? "0" : "") + String(currentHour) + ":" + 
                      (currentMinute < 10 ? "0" : "") + String(currentMinute) + ":" + 
                      (currentSecond < 10 ? "0" : "") + String(currentSecond);
                      
  return timeString;
}

// --- GESTION DES EVENEMENTS WEBSOCKET ---
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {

  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Client Déconnecté!\n", num);
      break;
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Client Connecté depuis %s url: %s\n", num, ip.toString().c_str(), payload);
      
      if (lastPayload.length() > 0) {
        String welcomeMsg = "Dernier evenement: " + lastPayload; 
        webSocket.sendTXT(num, welcomeMsg);
      }
      break;
    }
    case WStype_TEXT:
      Serial.printf("[%u] Reçu du client: %s\n", num, payload);
      break;
    default:
      break;
  }
}

// --- SETUP ---
void setup() {
  // Communication avec l'Arduino (Doit être 9600 bauds)
  Serial.begin(9600); 

  // Initialisation du Wi-Fi
  WiFi.begin(ssid, password);

  Serial.print("Connexion Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnecté au Wi-Fi !");
  Serial.print("Adresse IP: ");
  Serial.println(WiFi.localIP());
  
  // Démarrage du serveur NTP et WebSocket
  timeClient.begin();
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WebSocket Server demarre sur le port 81.");
  
  
  Serial.println("ESP_READY_WIFI_CONNECTED");
}


void loop() {
  webSocket.loop();
  if (Serial.available()) {
    String dataFromArduino = Serial.readStringUntil('\n'); 
    Serial.println(dataFromArduino);

    if (dataFromArduino.length() > 5) {
      Serial.println("Condition is ture");

      String currentTime = getTime();

      dataFromArduino.remove(dataFromArduino.lastIndexOf('}')); 
      String fullJsonPayload = dataFromArduino;
      fullJsonPayload += ", \"time\":\"" + currentTime + "\"}";

      lastPayload = fullJsonPayload;
      Serial.println(lastPayload);
      Serial.print("Payload JSON diffuse: ");
      Serial.println(fullJsonPayload);
      
      webSocket.broadcastTXT(fullJsonPayload);
      

      // Serial.println(currentTime); 
      
    } else {
      Serial.println("Donnee recue de l'Arduino invalide ou trop courte. Ignoree.");
    }
  }
}