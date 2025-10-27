import { Injectable } from "@angular/core";
import { MqttService } from "ngx-mqtt";

@Injectable({
    providedIn: 'root'
})
export class DtechMqttService {

    readonly TYPES = {
        Lights: {
            name: 'Lights',
            allowedTo: [
                'trigger',
                'changeBrightness',
                'changeRGB'
            ]
        },
        Garage: {
            name: 'Garage',
            allowedTo: [
                'trigger'
            ]
        },
        Switch: {
            name: 'Switch',
            allowedTo: [
                'sync'
            ]
        }
    }

    constructor(private mqtt : MqttService) { }

    trigger(deviceType: string, deviceId: string) {
        if (!this.isAllowedTo(deviceType, 'trigger')) {
            console.log('Action restricted for device type: ' + deviceType);
            return false;
        }

        try {
            this.mqtt.unsafePublish('Devices/' + deviceType + '/' + deviceId + '/state', 'trigger');
            return true;    
        } catch (error) {
            console.log('MQTT trigger failed: ' + error);
            return false;
        }
        
    }

    changeBrightness(deviceId: string, brightness: number) {
        if (brightness > 100 || brightness < 0) {
            console.log('Invalid brightness range');
            return false;
        }

        try {
            this.mqtt.unsafePublish('Devices/Lights/' + deviceId + '/brightness', brightness.toString());
            return true;   
        } catch (error) {
            console.log('MQTT changeBrightness failed: ' + error);
            return false;
        }
    }

    changeRGB(deviceId: string, hexCode: string) {
        if (!this.isHexCode(hexCode)) {
            console.log('Bad format of hexadecimal code: ' + hexCode);
            return false;
        }
        hexCode = hexCode.replace('#', '');

        try {
            this.mqtt.unsafePublish('Devices/Lights/' + deviceId + '/rgb', hexCode);
            return true   
        } catch (error) {
            console.log('MQTT changeRGB failed: ' + error);
            return false;
        }
    }

    syncOne(switchID: string, synchronizedDeviceID: string) {
        try {
            this.mqtt.unsafePublish('Devices/Switches/' + switchID + '/sync', synchronizedDeviceID);
            return true;
        } catch (error) {
            console.log('MQTT sync failed: ' + error);
            return false;
        }   
    }

    syncMany(switchID: string, synchronizedDevicesID: Array<string>) {
        try {
            synchronizedDevicesID.forEach(id => {
                this.mqtt.unsafePublish('Devices/Switches/' + switchID + '/sync', id);
            });
            return true;
        } catch (error) {
            console.log('MQTT multi-sync failed: ' + error);
            return false;
        }
    }

    unsyncOne(switchID: string, synchronizedDeviceID: string) {
        try {
            this.mqtt.unsafePublish('Devices/Switches/' + switchID + '/unsync', synchronizedDeviceID);
            return true;
        } catch (error) {
            console.log('MQTT sync failed: ' + error);
            return false;
        }   
    }

    unsyncMany(switchID: string, synchronizedDevicesID: Array<string>) {
        try {
            synchronizedDevicesID.forEach(id => {
                this.mqtt.unsafePublish('Devices/Switches/' + switchID + '/unsync', id);
            });
            return true;
        } catch (error) {
            console.log('MQTT multi-sync failed: ' + error);
            return false;
        }
    }

    private isAllowedTo(deviceType: string, action: string) {
        let result: Boolean = false;

        Object.values(this.TYPES).forEach(type => {
            if (deviceType === type.name) {
                result = type.allowedTo.toString().includes(action); 
            }
        });
        return result;
    }

    private isHexCode(hexCode: string) {
        if (hexCode.length !== 7 && !hexCode.includes('#')) return false;
        return true;
    }

}
