import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  templateUrl: './dialog-edit-switch.component.html',
  styleUrls: ['./dialog-edit-switch.component.scss']
})
export class DialogEditSwitchComponent {

    constructor(
      public dialogRef: MatDialogRef<DialogEditSwitchComponent>,
      @Inject(MAT_DIALOG_DATA) public currentSwitch: any
    ) {}

    dialogDataSwitch = new FormGroup ({
      name : new FormControl('',[Validators.required]),
      room : new FormControl('', [Validators.required]),
    });

  modifyData(): void {
    this.dialogRef.close({ name: this.dialogDataSwitch.get('name').value, room: this.dialogDataSwitch.get('room').value });
  }

  delete() {
    this.dialogRef.close("delete");
  }

  checkValid() : boolean {
    if(this.dialogDataSwitch.get('name').valid || this.dialogDataSwitch.get('room').valid) {
      return false;
    } else {
      return true;
    }
  }

}