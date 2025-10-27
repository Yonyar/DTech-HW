import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  templateUrl: './dialog-edit-room.component.html',
  styleUrls: ['./dialog-edit-room.component.scss']
})
export class DialogEditRoomComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogEditRoomComponent>,
    @Inject(MAT_DIALOG_DATA) public list: string[]
    ) {
      let selectedRooms = this.list;
      selectedRooms.find(room => {
        if (room !== "None") return
  
        selectedRooms.shift();
      })
    }

    dialogData = new FormGroup ({
      room_new : new FormControl('', [Validators.required]),
      room_delete : new FormControl('', [Validators.required])
    });

  modifyData(): void {
    this.dialogRef.close({ room: this.dialogData.get('room_new').value , action: "create" });
  }

  delete() {
    const index = this.list.indexOf(this.dialogData.get('room_delete').value);
    if (index > -1) {
      this.list.splice(index, 1);
    }
  }

  checkValidNew() : boolean {
    if(this.dialogData.get('room_new').valid) {
      return false;
    } else {
      return true;
    }
  }

  checkValidDelete() : boolean {
    if(this.dialogData.get('room_delete').valid) {
      return false;
    } else {
      return true;
    }
  }

}