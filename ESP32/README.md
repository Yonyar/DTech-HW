# DTech - ESP32 & PlatformIO
Let's program our microcontroller using [PlatformIO](https://platformio.org/).  
In my case, I work using the PlatformIO extension on [VS Code](https://marketplace.visualstudio.com/items?itemName=platformio.platformio-ide)

You have the complete program in this repository, and we´ll delve deeper into some points.
> 🧭 Check links above to prepare your favorite workspace.  

## Interesting points
- **Enable Arduino OTA (On The Air)** 
- **Use WifiManager library**
- **Quick review to MQTT using PubSubClient**
- **Solve Connection Issues** 

### Arduino OTA
We are developing software, but it has a strong dependency on hardware.  
> 💻 For now, in order to load program changes into ESP32, it's necessary to plug our PC into a physical board!

Of course, we don't want to search for our PCB board from wherever we decided to hide it every time we need to change some code.  
Luckly, using this library is easy and quick [Arduino OTA](https://github.com/arduino-libraries/Arduino_ESP32_OTA)
> 🧾 Check your controller to get a compatible library.

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
We can think big...
> 🔍 What happens if we carry our devices to other place, or we change our WiFi company or credentials at home?

Ups... We'd not have access to OTA.  
But we refuse to get our hardware again.
> 💡 Remember, PCB board probably was in a bulb!  

To solve that we can appeal to [WifiManager Library](https://github.com/tzapu/WiFiManager).

Now first time our ESP32 boot, it will create its own network. We can connect to that network and add credentials if we didn't add them before, or we need to change it.

Thanks to our colleagues doing the hard work, we can still do more.  
Let's add one more field as MQTT IP (It will be needed later) and customize the appearance! 
Move deeper, inside .pio's installed libraries

#### Change network name
I decided to name my devices as: "DTech_" + **MAC**

So, we can edit this part in **WiFiManager.cpp**:
```cpp
boolean WiFiManager::startConfigPortal() {  
  uint64_t EfuseMac = ESP_getChipId();
  byte *ar = (byte*) &EfuseMac;
  String ssid = "DTech_" + mac2String(ar);
  return startConfigPortal(ssid.c_str(), NULL);
}
```

Remember to the same logic to autoConnect function to find the correct SSID:
```cpp
boolean WiFiManager::autoConnect() {
  uint64_t EfuseMac = ESP_getChipId();
  byte *ar = (byte*) &EfuseMac;
  String ssid = "DTech_" + mac2String(ar);
  return autoConnect(ssid.c_str(), NULL);
}   
```

#### Add your Logo
We can modify the page's HTML code inside **WiFiManager.h**.  
In this line, you'll be able to change the background by a logo!   
```cpp
const char HTTP_STYLE[] PROGMEM  = ""
```
I found my logo and used it as **base64-encoded data**:
![Logo](img/DTech_img.png)  

#### Add an MQTT field
Let's go back to your main program and define a new variable. Then, call the method that fits your purpose:
```cpp 
char mqtt_server[40];
WiFiManagerParameter custom_mqtt_server("server", "mqtt server", mqtt_server, 40);

WiFiManager wifiManager;
wifiManager.setSaveConfigCallback(saveConfigCallback);
wifiManager.addParameter(&custom_mqtt_server);
```
> mqtt_server will contain your broker's IP address for using MQTT protocol

### PubSubClient
It's really easy to use MQTT with this library.  
We can publish messages to different *topics* and also subscribe to them, which allows us to "listen" only messages relevant to our device.

Here's how I imagine it:   
We have several devices (PCBs with an ESP32 each), and every device has a specific role -- lights, switches, blinds, etc. 
> *Each type of device will, of course, have its own program*.
When a new device connects, it sends a message with its *name&device_type* to a topic called "Devices/connected".  
Server listens to this topic to perform actions like notifiying the app and adding the device.  
We can do the same for a "Devices/disconnected" topic.

For a light device, we might have a main active topic: "Devices/Lights/device_id".   
Our device will listen here!  
We could also define sub-topics, each handled differently:
- */OnOff -> expects the strings "on" or "off"
- */Brightness -> expects a string between "0" and "100"
- */RGB -> expects a string with a hex RGB code 

> ⚠️ Only string messages can be sent, but possibilities are endless.


Let's implement it. Call the server in your setup():
> 🧠 Remember we're using a custom variable from WifiManager.

```cpp
client.setServer(mqtt_server, 1883);
```

Then, adjust your callback function:
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
We want the device to reconnect automatically after reboot or if the connection fails.   
> 🔗 It’s important to always stay connected — think about strategies to avoid network interruptions.   

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

