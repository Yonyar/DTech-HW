// ************************************************ //
//                      RGB LIGHT
//          Control:  OnOff, RGB, Brightness 
// ************************************************ //
// -------------- LIBRERIAS ---------------- //
#include "SPIFFS.h"
#include <Arduino.h>
#include <WiFi.h>
#include <DNSServer.h>
#include <WebServer.h>
#include <WiFiManager.h>
#include <ArduinoJson.h>
#include <ArduinoOTA.h>
#include <PubSubClient.h>
// ------------------------------------ //
//Funcion de declaracion - MAC to String
String mac2String(byte ar[]) {
  String s;
  for (byte i = 0; i < 6; ++i)
  {
    char buf[3];
    sprintf(buf, "%02X", ar[i]); // J-M-L: slight modification, added the 0 in the format for padding 
    s += buf;
    if (i < 5) s += ':';
  }
  return s;
}
// ---------- CONFIGURACION DE RED ---------- //
WiFiClient espClient;
PubSubClient client(espClient);
// ------------- DEFINICIONES -------------- //
char mqtt_server[40];
bool shouldSaveConfig = false;
const unsigned int RST = 21;        // GPIO21 - D21
bool memReset = false;
const int resetCountInit = 6;
int resetCount = resetCountInit;

String typeDevice = "rgb";
uint64_t EfuseMac = ESP.getEfuseMac();
String device_id = mac2String((byte*) &EfuseMac);
String device_name = "DTech_" + device_id;
String msgCheck = device_id + "&" + typeDevice; 
String topicDevice = "Devices/Lights/" + device_id;
String topicSubscribe = topicDevice + "/#";
String topicOnOff = topicDevice + "/state";
String topicBrightness= topicDevice + "/brightness";
String topicRGB = topicDevice + "/rgb";
// ---------------------------------------- //
const unsigned int R = 18;    // GPIO18
const unsigned int G = 17;    // GPIO17
const unsigned int B = 16;    // GPIO16

unsigned int r_color = 255;
unsigned int g_color = 255;
unsigned int b_color = 255;
unsigned int r_save = 255;
unsigned int g_save = 255;
unsigned int b_save = 255;
unsigned int r_write = 255;
unsigned int g_write = 255;
unsigned int b_write = 255;
unsigned int brightness = 100;
char *pointer;
unsigned int rgb = strtoul("ffffff",&pointer,16);
bool state = false;
// --------PWM PROPERTIES-------------- //
  const int freq = 1000;
  const int resolution = 8;
  const int RChannel = 0;
  const int GChannel = 1;
  const int BChannel = 2;
// ------------------------------------ //
//callback notifying us of the need to save config
void saveConfigCallback () {
  Serial.println("Should save config");
  shouldSaveConfig = true;
}
// ---------------------------------------- //
// Wifi connection
void callWiFi() {
  WiFiManagerParameter custom_mqtt_server("server", "mqtt server", mqtt_server, 40);

  WiFiManager wifiManager;
  wifiManager.setSaveConfigCallback(saveConfigCallback);
  wifiManager.addParameter(&custom_mqtt_server);
  wifiManager.autoConnect();

  delay(500);
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());
  memReset = false;
  strcpy(mqtt_server, custom_mqtt_server.getValue());

  if (shouldSaveConfig) {
    Serial.println("saving config");
    DynamicJsonBuffer jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();
    json["mqtt_server"] = mqtt_server;
    File configFile = SPIFFS.open("/config.json", "w");
    if (!configFile) {
      Serial.println("failed to open config file for writing");
    }

    json.printTo(Serial);
    json.printTo(configFile);
    configFile.close();
   }
}
// ---------------------------------------- //
// Reset Wifi
void resetWifi(){
  Serial.println("Reset Wifi");
  WiFi.disconnect(true,true);
  delay(500);
  callWiFi();
}
// ---------------------------------------- //
// Interrupt
ICACHE_RAM_ATTR void handleInterrupt() {
  if (!memReset){
    memReset = true;
  }
}
// ---------------------------------------- //
void callback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  const String strMessage = String((char*)payload);
  const char* charMessage = (char*)payload;
  const String strTopic = String(topic);
  
  Serial.print("Message arrived [");
  Serial.print(strTopic);
  Serial.print("] ");
  Serial.print(strMessage);
  Serial.println();
  
  if (strTopic == topicOnOff.c_str()) {
        if (strMessage == "trigger") {
          state = !state;
          Serial.print("State = ");
          Serial.println(state);
        } else {
          Serial.println("Unknown payload string");
        }
  } else if (strTopic == topicRGB.c_str()) {
        char *ptr;
        rgb = strtoul(charMessage,&ptr,16);
        if ((rgb >= 0x000000 && rgb <= 0xFFFFFF) && strlen(charMessage)==6) {
          r_color = rgb>>16;
          g_color = rgb>>8 & 0x0000FF;
          b_color = rgb & 0x0000FF;

          r_save = r_color*brightness/100;
          g_save = g_color*brightness/100;
          b_save = b_color*brightness/100;

          Serial.print("rgb = ");
          Serial.println(rgb);
        } else {
          Serial.println("RGB out of range");
        }
  } else if (strTopic == topicBrightness.c_str()) {
        char *ptr;
        brightness = strtoul(charMessage,&ptr,10);
        if (brightness >= 20 && brightness <= 100) {
          Serial.print("Brightness = ");
          Serial.println(brightness);

          r_save = r_color*brightness/100;
          g_save = g_color*brightness/100;
          b_save = b_color*brightness/100;

        } else {
          Serial.println("Brightness out of range");
        }
  } else {
      Serial.println("Unknown topic");
  } 
}


void setup() {
  Serial.begin(115200);

  pinMode(RST, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(RST), handleInterrupt, RISING);

  ledcSetup(RChannel, freq, resolution);
  ledcAttachPin(R, RChannel);
  ledcSetup(GChannel, freq, resolution);
  ledcAttachPin(G, GChannel);
  ledcSetup(BChannel, freq, resolution);
  ledcAttachPin(B, BChannel);
  
  Serial.println("mounting FS...");
  
  if (SPIFFS.begin(true)) {
    Serial.println("mounted file system");
    if (SPIFFS.exists("/config.json")) {
      //file exists, reading and loading
      Serial.println("reading config file");
      File configFile = SPIFFS.open("/config.json", "r");
      if (configFile) {
        Serial.println("opened config file");
        size_t size = configFile.size();
        // Allocate a buffer to store contents of the file.
        std::unique_ptr<char[]> buf(new char[size]);

        configFile.readBytes(buf.get(), size);
        DynamicJsonBuffer jsonBuffer;
        JsonObject& json = jsonBuffer.parseObject(buf.get());
        json.printTo(Serial);
        if (json.success()) {
          Serial.println("\nparsed json");
          
          strcpy(mqtt_server, json["mqtt_server"]);
        } else {
          Serial.println("failed to load json config");
        }
      }
    }
  } else {
    Serial.println("failed to mount FS");
  }

  callWiFi();

  ArduinoOTA.setHostname(device_name.c_str());
  ArduinoOTA.setPassword((const char *)"0032");

  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH) {
      type = "sketch";
    } else { // U_SPIFFS
      type = "filesystem";
    }
    Serial.println("Start updating " + type);
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) {
      Serial.println("Auth Failed");
    } else if (error == OTA_BEGIN_ERROR) {
      Serial.println("Begin Failed");
    } else if (error == OTA_CONNECT_ERROR) {
      Serial.println("Connect Failed");
    } else if (error == OTA_RECEIVE_ERROR) {
      Serial.println("Receive Failed");
    } else if (error == OTA_END_ERROR) {
      Serial.println("End Failed");
    }
  });
  ArduinoOTA.begin();

  delay(2000);
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  Serial.print("MAC: ");
  Serial.println(device_id);
}

void reconnect() {
  while (!client.connected() && resetCount>0) {
    Serial.println("Attempting MQTT connection...");
    if (client.connect(device_name.c_str(),"Devices/disconnected",1,false,msgCheck.c_str())) {
      Serial.println("MQTT Connected");
      client.subscribe(topicSubscribe.c_str());
      client.publish("Devices/connected",msgCheck.c_str());
    } else {
      Serial.print("failed, rc=");
      Serial.println(client.state());
      Serial.println(" ...Try again in 5 seconds");

    // Attempt limited
      //resetCount = resetCount - 1;
      //Serial.print("Remaining attempts: ");
      //Serial.println(resetCount);

      if (memReset){
        resetWifi();
      }

      delay(5000);
    }
  }
}

void loop() {
  ArduinoOTA.handle();

  if(state){
    r_write = r_save;
    g_write = g_save;
    b_write = b_save;
  } else {
    r_write = 0;
    g_write = 0;
    b_write = 0;
  }

  ledcWrite(RChannel, r_write);
  ledcWrite(GChannel, g_write);
  ledcWrite(BChannel, b_write);
  
  if (!client.connected() && resetCount>0) {
    reconnect();
  }

  // ----- Reset
  if (client.connected() && resetCount!=resetCountInit){
    resetCount = resetCountInit;
  }
  if (resetCount == 0){
    Serial.println("Intentos agotados");
    resetCount = -1;
    resetWifi();
    resetCount = resetCountInit;
  }
  if (memReset){
      resetWifi();
  }
  // ---------------

  client.loop();
}