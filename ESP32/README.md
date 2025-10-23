# DTech - ESP32 & PlatformIO
Let's program our microcontroller using [PlatformIO](https://platformio.org/).  
In my case, I work using the PlatformIO extension on [VS Code](https://marketplace.visualstudio.com/items?itemName=platformio.platformio-ide)

You have the complete program in this repository and we´ll deeper into some points.
> Check links above to prepare your favorite workspace.  

## Interesting points
- **Enable Arduino OTA (On The Air)** 
- **Use WifiManager library**
- **Quick review to MQTT using PubSubClient**
- **Solve Connection Issues** 

### Arduino OTA
We are developing software, but it has a strong dependency on hardware.  
> For now, in order to load program changes into ESP32, it's neccesary plug our PC in phisical board!

Of course, we don't want to search for our PCB board from wherever we decided to hide it every time we need to change some code.  
Luckly, use this library is easy and quick [Arduino OTA](https://github.com/arduino-libraries/Arduino_ESP32_OTA)
> Check your controller to get a compatible library.

Code Example:
```cpp
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
```

### WifiManager
We can thing big...
> What happends if we carry our devices to other side, or we change our WiFi company or credentials at home?

Ups... We'd not have access to OTA.  
But we refuse to get our hardware again.
> Remember, PCB board probaly was into a bulb!  

To solve that we can appeal to [WifiManager Library](https://github.com/tzapu/WiFiManager).

Now first time our ESP32 boot, it will create its own network. We can connect to that network and add credentials if we didn't add before or we need to change it.

Thanks to our colleagues doing the hard work, we can still do more.  
Let's add one more fields as MQTT IP (It will be needed later) and customize the appearance! 
Move deeper, inside .pio's installed libraries

#### Change network name
I decided to name my devices as: "DTech_" + **MAC**

So, we can edit this part on **WiFiManager.cpp**:
```cpp
boolean WiFiManager::startConfigPortal() {  
  uint64_t EfuseMac = ESP_getChipId();
  byte *ar = (byte*) &EfuseMac;
  String ssid = "DTech_" + mac2String(ar);
  return startConfigPortal(ssid.c_str(), NULL);
}
```

Remember add in autoConnect function in order to find the correct ssid:
```cpp
boolean WiFiManager::autoConnect() {
  uint64_t EfuseMac = ESP_getChipId();
  byte *ar = (byte*) &EfuseMac;
  String ssid = "DTech_" + mac2String(ar);
  return autoConnect(ssid.c_str(), NULL);
}   
```

#### Add your logo
We can change the page as HTML code on WiFiManager.h.  
In this line you'll be able to modify a background logo!   
```c
const char HTTP_STYLE[] PROGMEM
```
I create my logo and then convert it to base64 encoded data:

** [IMG]()

#### Add MQTT field
Let's back to your main program and define the new variable to use. Then, call the method that fix to your proppose:
```cpp 
char mqtt_server[40];
WiFiManagerParameter custom_mqtt_server("server", "mqtt server", mqtt_server, 40);

WiFiManager wifiManager;
wifiManager.setSaveConfigCallback(saveConfigCallback);
wifiManager.addParameter(&custom_mqtt_server);
```
> mqtt_server will contain our broker IP to use MQTT protocol

### PubSubClient
With this library it's really easy to use MQTT.
We can publish messages to different *topics* and also subscribe them, which allow us to "listen" only messages important for our device.

How do I imagine this:   
We have several devices (PCBs with an ESP32 each one) and every device have different roles: lights, switches, blinds...*Every kind of device will have different programs, of course*.
When a new device is connected, it send a message with its *name&device_type* into a topic called "Devices/connected" -> Server will be listen this topic to do something like notice our app and add the device into  
Same way to register "Devices/disconnected"  

For a light device connected we could have an active main topic: "Devices/Lights/device_id". Our device will be listen here!  
But we could have more sub-topics inside and each sub-topic will be manage on a different way.  :
- */OnOff -> is expected to receive the string "on" or "off"
- */Brightness -> is expected to receive a string between "0" and "100"
- */RGB -> is expected to receive a string with an hex rgb code 

> Only it's posible send string messages. However, options has no end.


Let's implement. Call the server on your setup:
> Remember we use a custom variable from WifiManager

```cpp
client.setServer(mqtt_server, 1883);
```

Then ajust your callback function:
```cpp
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
  
  if (strTopic == ???) {}
}
```

### Solve Conecction Issues
Automatic connection after reboot the device and also other attemps if connection fail.
> We need to stay always connected! It's important to think about ways to avoid network issues.  

```cpp
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

      delay(5000);
    }
  }
}
```

