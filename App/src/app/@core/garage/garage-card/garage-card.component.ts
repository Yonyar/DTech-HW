import { Component, Input } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { MqttService } from 'ngx-mqtt';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditGarageComponent } from '@app/@core/garage/dialogs/dialog-edit/dialog-edit-garage.component'

@Component({
  selector: 'dtech-garage-card',
  templateUrl: './garage-card.component.html',
  styleUrls: ['./garage-card.component.scss']
})

export class GarageCardComponent {
  @Input() id: string;
  @Input() name: string;
  @Input() conn: string;
  @Input() showEdits: string;

  firebasePointer = 'Devices/Garages/'
  disableTime : boolean = false;

  constructor(private db: AngularFireDatabase,
    private mqtt : MqttService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog
    ) { }

  toggleGarage(id: string) {    
    this.disableTime = true;
    //this.checkLocation(id);
    this.mqtt.unsafePublish(this.firebasePointer + id, 'switch');
    setTimeout(() => {
      this.disableTime = false;
    }, 2000);
  }

  checkLocation(id: string) {
    const mqttService = this.mqtt;
    const snackbarService = this.snackbar;
    const pointer = this.firebasePointer;

    this.db.database.ref('Location/')
        .on('value', snapshot => {
          const savelng = snapshot.child("longitude").val();
          const savelat = snapshot.child("latitude").val();
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(displayLocationInfo);
          }
          function displayLocationInfo(position){
            const lng = position.coords.longitude;
            const lat = position.coords.latitude;
            
            if (savelng == null || savelat == null){
              snackbarService.open("Location need to be setup", "Ok", {
                duration: 3000,
              });
            }
            else if(lng >= savelng-0.001 && lng <= savelng+0.001 && lat >= savelat-0.0015 && lat <= savelat+0.0015){
              mqttService.unsafePublish(pointer + id,'switch');
            }
            else {
              snackbarService.open("You are too far away", "Ok", {
                duration: 3000,
              });
            }
          }
        });
    }

    openDialogEdit() {
      const dialogRef = this.dialog.open(DialogEditGarageComponent, {
        data:  {id: this.id, name: this.name, conn: this.conn},
        autoFocus: false
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result===undefined || result===false) return;
        const ref = this.db.database.ref("Devices/Garages/" + this.id);
        if (result === "delete") {
          ref.remove();
          return;
        }        
        this.name = result;
        ref.update({name: result});
      });
    }
}
