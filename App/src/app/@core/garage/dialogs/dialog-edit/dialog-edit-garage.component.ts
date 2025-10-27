import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  templateUrl: './dialog-edit-garage.component.html',
  styleUrls: ['./dialog-edit-garage.component.scss']
})
export class DialogEditGarageComponent {

  constructor(
    private db: AngularFireDatabase,
    private snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<DialogEditGarageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {id: string, name: string, conn: boolean}
    ) {}

    dialogData = new FormGroup ({
      name : new FormControl('', [Validators.required])
    });

  modifyData(): void {
    this.dialogRef.close(this.dialogData.get('name').value);
  }

  delete() {
    this.dialogRef.close("delete");
  }

  checkValid() : boolean {
    if(this.dialogData.get('name').valid) {
      return false;
    } else {
      return true;
    }
  }

  getLocation() {
    const displayLocationInfo = position => {
      const lng = position.coords.longitude;
      const lat = position.coords.latitude;

      this.db
      .database
      .ref('Location')
      .update({
        longitude : lng,
        latitude : lat
      }).then(() => {
        this.snackbar.open("Garage location changed to current", "Ok", {
          duration: 3000,
        });
      });
    }

    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(displayLocationInfo);
  }

}