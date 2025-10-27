import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { Light } from '@app/models/light.model';
import { DialogEditRoomComponent } from '@app/@core/lights/dialogs/dialog-edit/dialog-edit-room.component';
import { AngularFireDatabase } from '@angular/fire/database';

export interface DialogData {
  light: Light;
  rooms: string[];
}

@Component({
  templateUrl: './dialog-edit-light.component.html',
  styleUrls: ['./dialog-edit-light.component.scss']
})
export class DialogEditLightComponent {

  constructor(
    private db : AngularFireDatabase,
    public dialogRoom: MatDialog,
    public dialogRef: MatDialogRef<DialogEditLightComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    dialogData = new FormGroup ({
      name : new FormControl('',[Validators.required]),
      room : new FormControl('', [Validators.required]),
      transit : new FormControl('', [Validators.required]),
    });

  modifyData(): void {
    this.dialogRef.close({ name: this.dialogData.get('name').value, room: this.dialogData.get('room').value, transit: this.dialogData.get('transit').value });
  }

  delete() {
    this.dialogRef.close("delete");
  }

  checkValid() : boolean {
    if(this.dialogData.get('name').valid || this.dialogData.get('room').valid || this.dialogData.get('transit').valid) {
      return false;
    } else {
      return true;
    }
  }

  openRoomDialog() {    
    const dialogRef = this.dialogRoom.open(DialogEditRoomComponent, {
      data: this.data.rooms,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      this.data.rooms.unshift("None");
      if (result === undefined || result === false) return;
      if (result.action === "create") {
        this.data.rooms.push(result.room);
      }
      this.db.database.ref("Rooms").set(this.data.rooms);
    })
  }

}