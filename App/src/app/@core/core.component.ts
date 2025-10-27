import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { Subscription } from 'rxjs';

@Component({
  template: '<dtech-sidenav></dtech-sidenav>'
})
export class CoreComponent {
    private readonly subscriptionDisconnected: Subscription = this.mqtt.observe("Devices/disconnected").subscribe((message: IMqttMessage) => {
        const id = message.payload.toString().split("&").shift();
        this.snackbar.open("DTech_"+ id, "disconnected!", {
            duration: 3000,
        });    
    });
    
    private readonly subscriptionReconnected: Subscription = this.mqtt.observe("Devices/reconnected").subscribe((message: IMqttMessage) => {
        const id = message.payload.toString().split("&").shift();
        this.snackbar.open("DTech_"+ id, "re-connected!", {
          duration: 3000,
        });     
    });
    
    private readonly subscriptionNewDevice: Subscription = this.mqtt.observe("Devices/new").subscribe((message: IMqttMessage) => {
        const id = message.payload.toString();
        this.snackbar.open("Added new device", "DTech_" + id, {
          duration: 3000,
        });     
    });
   
    constructor(private mqtt: MqttService, private snackbar: MatSnackBar){ }

    ngOnDestroy(): void {
        this.subscriptionDisconnected.unsubscribe();
        this.subscriptionReconnected.unsubscribe();
        this.subscriptionNewDevice.unsubscribe();
    }
}