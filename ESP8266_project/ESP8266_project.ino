#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>
#include <ESP8266HTTPClient.h> 
#include <ArduinoJson.h>
#include <time.h>       // Native time library
#include <sys/time.h>   // Struct timeval

// --- CONFIGURATION WI-FI ---
const char* ssid = "HUAWEI-2.4G-96As"; 
const char* password = "CNcnKK28"; 

// --- CONFIGURATION TEMPS
const long  gmtOffset_sec = 3600;
const int   daylightOffset_sec = 0; 

WebSocketsServer webSocket = WebSocketsServer(81); 

// --- VARIABLES GLOBALES ---
String lastEventPayload = ""; 

// --- FONCTION UTILITAIRE : OBTENIR LE TEMPS ---
String getTime() {
  time_t now = time(nullptr);
  struct tm* ptm = localtime(&now);

  // If year is 1970, time is not synced yet
  if (ptm->tm_year + 1900 < 2000) {
    return "NOT_SYNCED";
  }

  // Use a buffer to format the string cleanly
  char timeStringBuff[50]; 
  // Format: YYYY-MM-DD HH:MM:SS
  strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%d %H:%M:%S", ptm);

  return String(timeStringBuff);
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
      
      if (lastEventPayload.length() > 0) {
        String welcomeMsg = "{\"type\":\"LAST_EVENT\", \"payload\":" + lastEventPayload + "}";
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
  
  // --- NATIVE TIME CONFIGURATION ---
  // Configures time using built-in SNTP
  configTime(gmtOffset_sec, daylightOffset_sec, "pool.ntp.org", "time.nist.gov");
  
  Serial.print("Attente de la synchronisation de l'heure");
  time_t now = time(nullptr);
  while (now < 100000) { // Wait until we are past the year 1970
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("\nHeure synchronisee !");
  Serial.println(getTime());

  // Start WebSocket
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
    dataFromArduino.trim(); 

    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, dataFromArduino);

    if (error) {
      Serial.print(F("deserializeJson() failed: "));
      Serial.println(error.f_str());
      Serial.println("Donnee invalide. Ignoree.");
    } else {
      String currentTime = getTime();
      doc["time"] = currentTime;

      String fullJsonPayload;
      serializeJson(doc, fullJsonPayload);
      
      lastEventPayload = fullJsonPayload; 
      Serial.print("Payload JSON diffuse: ");
      Serial.println(fullJsonPayload);
      
      webSocket.broadcastTXT(fullJsonPayload);
    }
  }
}