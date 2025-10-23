# DTech - RaspberryPi
A relevant piece to build a functional home automation App
> MQTT broker running in background is needed!

This server will be the API between ESP32 and App, managing all messages and updating properly our database.  
To achieve this purpose I'm using Firebase.

We won't be talking about how to install a Raspberry Pi image -> [Here](https://www.raspberrypi.com/documentation/computers/getting-started.html)
Neither how to create a firebase account nor a real-time database  -> [Here](https://firebase.google.com/?hl=es-419)

> **Note:** In my case, App will only use database to work, so this service translate MQTT to database structure.

We´ll do a quick tour of this intermediate service.

### Install MQTT.js 
Follow this [*repository*](https://github.com/hansemannn/raspberry-mqtt-nodejs/blob/master/docs-mqttjs.md) to get your broker on Node.js.
```js
var mqtt=require('mqtt');
var clientMqtt = mqtt.connect("mqtt://192.168.0.151",{clientId:"API"});
```

### Init Firebase
As I'm using JavaScript over Node.js, let's hide data using .env folder (*privacy is mandatory* 👀).

Follow firebase steps to get your database ready and accessible by Raspberry Pi:
```js
function initFirebase() {
const firebase = require("firebase/app");
require("firebase/database");

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE,
    messagingSenderId: process.env.MSG_ID,
    appId: process.env.APP_ID
};

!firebase.apps.length
    ? firebase.initializeApp(firebaseConfig)
    : firebase.app();

return firebase;
}
```

### Topic Subscription
Let's start listening "Devices" topic.  
Observe how "Devices/connected" and "Devices/disconnected" topics have been declare to use later.   
I subscribe to a general "Devices/#" topic to hear everything about my devices.
```js
clientMqtt.on("connect",function(){	
    console.log("API Connected to MQTT");
    if (clientMqtt.connected==true) {
        const firebase = initFirebase();
        const topicConnected = "Devices/connected";
        const topicDisconnected = "Devices/disconnected";

        clientMqtt.subscribe("Devices/#",{qos:1});
    }
})
```

### Getting Device Type
If we remember, when ESP32 power on it always send *name&type*.  
You´ll see why I get ID + TYPE soon.   
I have prepared lot of possible types devices!   
```js
clientMqtt.on('message',function(topic, message){
    var str = message.toString();
    const device_id = str.split("&").shift();
    const device_type = str.split("&").pop();
    let subtopic = "Unknow";
    switch (device_type) {
        case "light":
            subtopic = "Lights";
            break;
        case "rgb": 
            subtopic = "Lights";
            break;
        case "switch":
            subtopic = "Switches";
            break;
        case "blind":
            subtopic = "Blinds";
            break;
        case "garage":
            subtopic = "Garages";
            break;
        default:
            subtopic = "Unknow";
            break;
    }
})
```

### Device Connected
Things are getting interesting...   
I ask if topic is "Devices/connected":
```js
if (topic === topicConnected){ ... }
```

Then I use firebase checking if that device already exist in database!   
```js
firebase.database().ref("Devices").once('value', snapshot => {
    if (snapshot.child("Lights").child(device_id).val() == null &&
        snapshot.child("Switches").child(device_id).val() == null &&
        snapshot.child("Blinds").child(device_id).val() == null &&
        snapshot.child("Garages").child(device_id).val() == null )
    { ... }
}
```

If not exist, I create the data structure and push to database.  
For RGB Light I though something like this:
```js
case "rgb":
    subtopic = "Lights";
    new_name = "Light RGB";
    new_room = "None";
    new_data = {
        state: false,
        brightness: 100,
        color: "#0000ff",
        savedColors : ['#ff0000','#00ff00','#0000ff'],
        options: {
            rgb: true,
            transit: false,
            connected: true
        }
    };
    break;

const new_device = {
    id: device_id,
    name: new_name,
    room: new_room,
    data: new_data
}

firebase.database().ref("Devices/" + subtopic + "/" + device_id.toString()).update(new_device);
clientMqtt.publish('Devices/new', device_id.toString());
```

If already exist, I only have to change *connected* field in database (also inform into mqtt):
```js
else {
    console.log("DTech_" + device_id + " already exist!");
    firebase.database().ref("Devices/" + subtopic + "/" + device_id.toString()).child("data").child("options").update({connected: true});
    clientMqtt.publish('Devices/reconnected', device_id.toString());
}
```

With reconnected cases, I decided to reset at default values:
```js
case "rgb":
    firebase.database().ref("Devices/Lights/" + device_id.toString() + "/data").once('value', snapshot => {
        const state = snapshot.child("state").val();
        console.log("Saved state: " + state);
        const brightness = snapshot.child("brightness").val();
        console.log("Saved brightness: " + brightness);
        let color = snapshot.child("color").val().replace("#","");
        console.log("Saved color: " + color);
        clientMqtt.publish('Devices/Lights/' + device_id.toString() + '/rgb', color.toString());
        clientMqtt.publish('Devices/Lights/' + device_id.toString() + '/brightness', brightness.toString());
        if (state){
            clientMqtt.publish('Devices/Lights/' + device_id.toString() + '/state', "trigger");
        }
    });
    break;
```

### Device Disconnected
When a device disconnect from MQTT, it send a last msg on "Devices/disconnected".   
So, we can advise our database to update:
```js
if (topic === topicDisconnected){
    console.log("Disconnected " + str);
    firebase.database().ref("Devices/" + subtopic + "/" + device_id.toString()).child("data").child("options").update({connected: false});
    console.log("Device of " + subtopic + " with ID:" + device_id.toString() + " set as disconnected");
}
```

### MQTT actions
We arrive here if topic isn`t "connected" and "disconnected".   
For example, when a light type device have an action over mqtt we´ll receive "Devices/Lights/*action*".  
I thought 3 posible actions:
- state: "trigger" toggle the light state (On/Off)
- brightness: str number value
- rgb: hex rgb code

Each action will update database consistenly:
```js
const elementType = topic.toString().split("/",2).pop();
const elementID = topic.toString().split("/",3).pop();
const elementAction = topic.toString().split("/",4).pop();

let data = {};
if (elementType === "Lights") {
    switch (elementAction) {
        case "state":
            firebase.database().ref("Devices/Lights/" + elementID + "/data/state").once("value", snapshot => {
                data = {"state": !snapshot.val()};
                firebase.database().ref("Devices/" + elementType + "/" + elementID + "/data").update(data);
            });
            break;
        case "brightness":
            data = {"brightness" : Number(message.toString())};
            firebase.database().ref("Devices/" + elementType + "/" + elementID + "/data").update(data);
            break;
        case "rgb":
            data = {"color" : "#"+message.toString()};
            firebase.database().ref("Devices/" + elementType + "/" + elementID + "/data").update(data);
            break;
        default:
            break;
    }
}
```
