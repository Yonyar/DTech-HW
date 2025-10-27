import { Component, Input, OnChanges } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { DtechMqttService } from '@app/@providers/dtech-mqtt.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'dtech-light-item',
  templateUrl: './light-item.component.html',
  styleUrls: ['./light-item.component.scss']
})
export class LightItemComponent implements OnChanges {

  @Input() id: number;
  @Input() name: string;
  @Input() room: string;
  @Input() conn: boolean;

  constructor(
    private db: AngularFireDatabase, 
    private dtechMqtt: DtechMqttService,
    private snackbar: MatSnackBar) { }

  ngOnChanges(): void {  
  }

  getCurrentSwitch(): HTMLElement {
    let currentSwitch: HTMLElement;
    Array.from(document.getElementsByClassName('carousel-item')).forEach(element => {
      const htmlElement = <HTMLElement>element;
      if (htmlElement.style.left === '50%') currentSwitch = htmlElement;
    });

    return currentSwitch;
  }

  assignLightToCurrentSwitch(lightId: string) {  
    if (this.getCurrentSwitch() === undefined) {
      this.snackbar.open("Any switch avalaible", "Ok", {
        duration: 3000,
      });
      return;
    }
    const switchId = this.getCurrentSwitch().id;
    const ref = this.db.database
                .ref('Devices/Switches/' + switchId + '/data/lightLinks')
                
    ref.once("value", snapshot => {
      if (snapshot.val() === undefined || snapshot.val() === null) {
        ref.push(lightId);
        this.dtechMqtt.syncOne(switchId, lightId);
        return false;
      }
      
      const allLights = Object.keys(snapshot.val());
      const lightIndex = Object
        .values(snapshot.val())
        .findIndex((id: string) => id === lightId);

      if (lightIndex === -1) {
        ref.push(lightId);
        this.dtechMqtt.syncOne(switchId, lightId);
        return false;
      }
      ref.child(allLights[lightIndex]).remove();
      this.dtechMqtt.unsyncOne(switchId, lightId);
      return true;
    });
  }

}
