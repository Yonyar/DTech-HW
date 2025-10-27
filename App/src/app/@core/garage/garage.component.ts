import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Garage } from '@app/models/garage.model';
import { viewReady } from '@app/@shared/utils/view-state';

@Component({
  templateUrl: './garage.component.html',
  styleUrls: ['./garage.component.scss']
})
export class GarageComponent implements OnInit {

  garages: Array<Garage>;
  loading: boolean = true;
  showEdits: boolean = false;

  constructor(private db: AngularFireDatabase) { }

  ngOnInit(): void {
    const iconToggleEdits = document.getElementById("icon-toggleEdits");
    const drawerOpened = document.getElementsByClassName("mat-drawer-opened");

    this.db.database.ref("Devices/Garages").once("value", snapshot => {
      const result = snapshot.val();
      if (result === null || result === undefined) {
        this.garages = [];
        this.showEdits = false;
        return;
      }
      this.garages = Object.values(snapshot.val());
    });

    viewReady(() => {
      if (drawerOpened.length > 0 && iconToggleEdits!==null) {
        iconToggleEdits.classList.add("hide");
      }
      this.loading = false;
    });

    this.db.object('Devices/Garages').snapshotChanges().subscribe(snapshot => {
      const result = snapshot.payload.val();
      if (result === null || result === undefined) {
        this.garages = [];
        this.showEdits = false;
        return;
      }
      this.garages = Object.values(snapshot.payload.val());
    });
  }

  toggleEdits() {
    this.showEdits = !this.showEdits;
  }

  emptyGarages() {
    if (this.garages === undefined) return;
    if (this.garages.length === 0) return true;
    else return false;
  }

}
