import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditSwitchComponent } from '@app/@core/switches/dialogs/dialog-edit/dialog-edit-switch.component';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'dtech-carousel-item',
  templateUrl: './carousel-item.component.html',
  styleUrls: ['./carousel-item.component.scss']
})
export class CarouselItemComponent implements OnInit {

  @Input() id: string;
  @Input() name: string;
  @Input() room: string;
  @Input() conn: boolean;
  @Input() lightLinks: Array<string>;
  @Input() showEdits: boolean;

  constructor(public dialog: MatDialog, private db : AngularFireDatabase, private snackbar: MatSnackBar) { }

  ngOnInit(): void {}

  openDialogEdit(id:string, name:string, room:string, conn: boolean) {
    const dialogRef = this.dialog.open(DialogEditSwitchComponent, {
      data: {id:id, name:name, room:room, conn:conn},
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result===undefined || result===false) return;
      const ref = this.db.object('Devices/Switches/' + id);
      if (result==="delete"){
        ref.remove().then(() => {
          this.snackbar.open("It will be auto-installed if re-connected", "Switch deleted!", {
            duration: 3000,
          });
        });
        return;  
      }
      if (result.name !== ""){
        ref.update({name : result.name});
      }
      if (result.room !== ""){
        ref.update({room : result.room});
      }
    });
  }

}
