import { Component, Input, OnDestroy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Light } from '@app/models/light.model';
import { viewReady } from '@app/@shared/utils/view-state'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'dtech-lights-container',
  templateUrl: './lights-container.component.html',
  styleUrls: ['./lights-container.component.scss']
})
export class LightsContainerComponent implements OnInit, OnDestroy, OnChanges {
  
  @Input() currentSwitch: HTMLElement;

  loading: boolean = true;

  lights: Array<Light> = [];
  subscriptionLights: Subscription;
  subscriptionSwitches: Subscription;

  constructor(private db : AngularFireDatabase) { 
  }

  ngOnInit(): void {    
    this.subscriptionSwitches = this.db.object('Devices/Switches').snapshotChanges().subscribe(snapshot => {
      viewReady(() => {
          this.updateLightsClass();
          this.loading = false;
      });
    });
    this.subscriptionLights = this.db.object('Devices/Lights').snapshotChanges().subscribe(snapshot => {
      const result = snapshot.payload.val();
      if (result === null) return;
      
      this.lights = Object.values(result);
      if (this.lights.length === 0) return;

      viewReady(() => {
          this.updateLightsClass();
      });
    });
  }

  ngOnDestroy() {
    this.subscriptionLights.unsubscribe();
    this.subscriptionSwitches.unsubscribe();
  }

  ngOnChanges( changes: SimpleChanges) {
    if (changes.currentSwitch.previousValue === undefined) return;
    if (changes.currentSwitch.previousValue.id === changes.currentSwitch.currentValue.id) return;   
    this.updateLightsClass();
  }

  updateLightsClass() {    
    const linkedLights = this.getAllLinkedLightsId();    
    var unlinkedLights = [];
    if (linkedLights !== null && linkedLights !== undefined) {
          
      linkedLights.forEach(id => {
        if (id === null) return
        const element = document.getElementById(id);
        if (element !== null) {
          element.classList.remove("unlinked"); 
          element.classList.add("linked");
        }
      });
      unlinkedLights = this.lights.map(e => e.id.toString()).filter(e => !linkedLights.includes(e));
    }
    if (unlinkedLights !== null && unlinkedLights !== undefined) {
      unlinkedLights.forEach(id => {
        if (id === null) return
        
        document.getElementById(id).classList.remove("linked"); 
        document.getElementById(id).classList.add("unlinked");      
      });
    }
  }

  getAllLinkedLightsId() {    
    if (this.currentSwitch === undefined) return;
    let linkedLights: Array<string> = [];
    this.db.database.ref('Devices/Switches/' + this.currentSwitch.id).once("value", snapshot => {
      const links = snapshot.child('data').child('lightLinks').val();
      if (links === undefined || links === null) return;
      linkedLights = Object.values(links);
    });

    return linkedLights;
  }
}
