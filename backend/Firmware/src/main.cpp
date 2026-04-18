#include <Arduino.h>
#include <WiFi.h>
#include <WiFiManager.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "secrets.h"

//Sensor Configuration 
#define DHTPIN 4
#define DHTTYPE DHT11
#define MQ_PIN 34 

DHT dht(DHTPIN, DHTTYPE);

//AWS/MQTT Configuration
#define AWS_IOT_PUBLISH_TOPIC "esp32/iot_food_monitor/data"

constexpr char WIFI_PORTAL_NAME[] = "FreshGuard Setup";
constexpr char WIFI_PORTAL_PASSWORD[] = "freshguard";

WiFiClientSecure net = WiFiClientSecure();
PubSubClient client(net);

String getMqttClientId() {
  const uint64_t chipId = ESP.getEfuseMac();
  return "ESP32_Food_Monitor_" + String(static_cast<uint32_t>(chipId & 0xFFFFFFFF), HEX);
}

void syncClock() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("Synchronizing time");

  while (time(nullptr) < 1000000000L) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nTime Synchronized!");
}

void configureAwsClient() {
  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);
  client.setServer(AWS_IOT_ENDPOINT, 8883);
  client.setBufferSize(512);
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);

  WiFiManager wifiManager;
  wifiManager.setConfigPortalTimeout(180);
  wifiManager.setConnectTimeout(20);
  wifiManager.setTitle("FreshGuard Wi-Fi Setup");

  Serial.println("Connecting to saved Wi-Fi or opening setup portal...");
  const bool connected = wifiManager.autoConnect(WIFI_PORTAL_NAME, WIFI_PORTAL_PASSWORD);

  if (!connected) {
    Serial.println("Wi-Fi setup timed out. Restarting ESP32...");
    delay(1000);
    ESP.restart();
  }

  Serial.println("\nWi-Fi Connected!");
  Serial.print("Connected SSID: ");
  Serial.println(WiFi.SSID());
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

bool connectMQTT() {
  const String mqttClientId = getMqttClientId();
  Serial.print("Connecting to AWS IoT as ");
  Serial.println(mqttClientId);

  uint8_t attempts = 0;
  while (!client.connected() && attempts < 10) {
    if (client.connect(mqttClientId.c_str())) {
      Serial.println("AWS IoT Connected Successfully!");
      return true;
    }

    attempts++;
    Serial.print("MQTT connect failed, state: ");
    Serial.print(client.state());
    Serial.println(" Retrying in 2 seconds...");
    delay(2000);
  }

  Serial.println("AWS IoT connection attempts exhausted.");
  return client.connected();
}

//Connection Functions 
void connectAWS() {
  connectWiFi();
  syncClock();
  configureAwsClient();
  connectMQTT();
}

void maintainConnection() {
  //Check Wi-Fi Connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi connection lost. Reconnecting...");
    WiFi.disconnect();
    connectWiFi();
    syncClock();
    configureAwsClient();
  }

  //Check MQTT (AWS) Connection
  if (!client.connected()) {
    Serial.println("AWS MQTT connection lost. Reconnecting...");
    connectMQTT();
  }
}

//Data Publishing Function
void publishMessage(float temp, float humidity, int gasLevel) {
  JsonDocument doc;
  
  // Reverted to hardcoded ESP32_Node_1 to match physical QR code
  doc["device_id"] = "ESP32_Node_1";
  doc["temperature"] = temp;
  doc["humidity"] = humidity;
  doc["gas"] = gasLevel;

  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer, sizeof(jsonBuffer));

  const bool published = client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
  if (published) {
    Serial.println("Payload published to AWS!");
  } else {
    Serial.print("AWS publish failed. MQTT state: ");
    Serial.println(client.state());
  }
}

//Main Setup & Loop
void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("System Initializing..."); 
  
  connectAWS();
}

unsigned long lastMsgTime = 0;

void loop() {
  //Ensure connections are alive
  maintainConnection();
  client.loop(); 

  unsigned long now = millis();
  if (now - lastMsgTime > 5000) {
    lastMsgTime = now;

    //Read Sensors
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int gasValue = analogRead(MQ_PIN);

    //Error checking & Publishing
    if (isnan(h) || isnan(t)) {
      Serial.println("Failed to read from DHT sensor! Skipping AWS publish.");
    } else {
      Serial.print("Hum: "); Serial.print(h); Serial.print("% | ");
      Serial.print("Temp: "); Serial.print(t); Serial.print("°C | ");
      Serial.print("Gas: "); Serial.println(gasValue);

      //Send the actual sensor data to the cloud
      publishMessage(t, h, gasValue);
    }

    Serial.println("-----------------------");
  }
}
