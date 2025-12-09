#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>

#define SS_PIN 10   // << RFID : Conserve la broche 10
#define RST_PIN 9
#define BUZZER 8

// NOUVELLES BROCHES POUR L'ESP8266 (SoftwareSerial)
#define ESP_RX_PIN 2 // Arduino RX (pour recevoir de l'ESP)
#define ESP_TX_PIN 3 // Arduino TX (pour transmettre à l'ESP)

MFRC522 rfid(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27,16,2);

// Création de l'objet SoftwareSerial avec les nouvelles broches
SoftwareSerial ESP(ESP_RX_PIN, ESP_TX_PIN);

String lastDatetime = "";

void setup() {
  Serial.begin(9600); 
  ESP.begin(9600);    
  SPI.begin();
  rfid.PCD_Init();

  pinMode(BUZZER, OUTPUT);
  
  lcd.init();
  lcd.backlight();
  lcd.print("Systeme RFID");
  delay(1500);
  lcd.clear();
}

void loop() {
  rfid.PCD_Init();
  lcd.clear();
  if (ESP.available()) {
    Serial.println("ESP est ready");
  }

  if (!rfid.PICC_IsNewCardPresent()){
    return;
  } 
  if (!rfid.PICC_ReadCardSerial()) return;

  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();

  tone(BUZZER, 1000, 500);
  delay(500);
  noTone(BUZZER);

  String jsonSend = "{\"uid\":\"" + uid + "\"}";
  ESP.println(jsonSend); 

  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("UID:");
  lcd.print(uid);

  lcd.setCursor(0,1);
  lcd.print(lastDatetime);

  delay(2000);

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  rfid.PCD_Init();
}