var mqtt=require('mqtt');
var clientMqtt = mqtt.connect("mqtt://192.168.0.151",{clientId:"API"});
require('dotenv').config();

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

  clientMqtt.on("connect",function(){	
    console.log("API Connected to MQTT");
    if (clientMqtt.connected==true) {
        const firebase = initFirebase();
        const topicConnected = "Devices/connected";
        const topicDisconnected = "Devices/disconnected";
    
        clientMqtt.subscribe("Devices/#",{qos:1});
    
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

            if (topic === topicDisconnected){
                console.log("Disconnected " + str);
                firebase.database().ref("Devices/" + subtopic + "/" + device_id.toString()).child("data").child("options").update({connected: false});
                console.log("Device of " + subtopic + " with ID:" + device_id.toString() + " set as disconnected");
            }

            if (topic === topicConnected){
                console.log("ChipID is "+ device_id);
                firebase.database().ref("Devices").once('value', snapshot => {
                if (snapshot.child("Lights").child(device_id).val() == null &&
                    snapshot.child("Switches").child(device_id).val() == null &&
                    snapshot.child("Blinds").child(device_id).val() == null &&
                    snapshot.child("Garages").child(device_id).val() == null ){
                        console.log("DTech_" + device_id.toString() + " will be pushed");
                        let new_name = "default";
                        let new_data = {};
                    switch (device_type) {
                        case "light":
                            subtopic = "Lights";
                            new_name = "Light";
                            new_room = "None";
                            new_data = {
                                state: false,
                                brightness: 100,
                                options: {
                                    rgb: false,
                                    transit: false,
                                    connected: true
                                }
                            };
                            break;
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
                        case "switch":
                            subtopic = "Switches";
                            new_name = "Switch";
                            new_room = "";
                            new_data = {
                                options: {
                                    connected: true
                                }
                            };
                            break;
                        case "blind":
                            subtopic = "Blinds";
                            new_name = "Blind";
                            new_room = "None";
                            new_data = {
                                options: {
                                    connected: true
                                }
                            };
                            break;
                        case "garage":
                            subtopic = "Garages";
                            new_name = "Garage";
                            new_room = "";
                            new_data = {
                                options: {
                                    connected: true
                                }
                            };
                            break;
                        default:
                            break;
                    }
                    const new_device = {
                        id: device_id,
                        name: new_name,
                        room: new_room,
                        data: new_data
                    }

                    firebase.database().ref("Devices/" + subtopic + "/" + device_id.toString()).update(new_device);
                    clientMqtt.publish('Devices/new', device_id.toString());
                }
                else {
                    console.log("DTech_" + device_id + " already exist!");
                    firebase.database().ref("Devices/" + subtopic + "/" + device_id.toString()).child("data").child("options").update({connected: true});
                    clientMqtt.publish('Devices/reconnected', device_id.toString());
                    switch (device_type) {
                        case "light":
                            firebase.database().ref("Devices/Lights/" + device_id.toString() + "/data").once('value', snapshot => {
                                const state = snapshot.child("state").val();
                                console.log("Saved state: " + state);
                                if (state){
                                    clientMqtt.publish('Devices/Lights/' + device_id.toString() + '/state', "trigger");
                                }
                            });
                            break;
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
                        case "switch":
                            firebase.database().ref("Devices/Switches/" + device_id.toString() + "/data").once('value', snapshot => {
                                const linked = snapshot.child("lightLinks").val();
                                if (linked === null) return;
                                const deviceslinked = Object.values(snapshot.child("lightLinks").val());
                                console.log("Devices linked: " + deviceslinked);
                                deviceslinked.forEach(device => {
                                    clientMqtt.publish('Devices/Switches/' + device_id.toString() + '/sync', device.toString());
                                });
                            });
                            break;
                        case "blind":
                            break;
                        case "garage":
                            break;   
                    }
                    
                }
            });
            }

            // *** Register Mqtt actions on DB *** //
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
        });
    }
})

clientMqtt.on("error",function(error){
    console.log("Can't connect " + error);
})
