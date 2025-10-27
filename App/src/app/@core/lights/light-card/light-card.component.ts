import { Component, Input, OnInit } from '@angular/core';
import { DtechMqttService } from '@app/@providers/dtech-mqtt.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatSnackBar } from '@angular/material/snack-bar';
import { viewReady } from '@app/@shared/utils/view-state';
import { Light } from '@app/models/light.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditLightComponent } from '@app/@core/lights/dialogs/dialog-edit/dialog-edit-light.component'

@Component({
  selector: 'dtech-light-card',
  templateUrl: './light-card.component.html',
  styleUrls: ['./light-card.component.scss'],
})

  export class LightCardComponent implements OnInit  {

  @Input() drawerOpened: boolean;
  trackById = (device : Light) => device.id;  

  defaultColors: string[] = ['#ff0000','#00ff00','#0000ff'];
  maxColorSaved = 8;

  loading: boolean = true;
  showEdits : boolean = false;
  saveIndexExpanded : number = undefined;
  deleted : boolean = false;
  lights : Array<Light>;
  rooms : Array<string>;

  constructor(private dtechMqtt : DtechMqttService, 
              private db : AngularFireDatabase,
              private snackbar: MatSnackBar,
              public dialog: MatDialog) {}

  ngOnInit() {
    const iconToggleEdits = document.getElementById("icon-toggleEdits");
    const drawerOpened = document.getElementsByClassName("mat-drawer-opened");

    this.db.database.ref('Rooms').once("value", snapshot => {
      this.rooms = [];
      if (snapshot.val() === null) {
        this.rooms = [ "None" ];
        this.db.database.ref("Rooms").set(this.rooms);
        return;
      }
      this.rooms = snapshot.val();
      if (this.lights !== undefined) this.updateRooms();
    })

    this.db.database.ref('Devices/Lights').once("value", snapshot => {
      this.lights = [];
    if (snapshot.val() !== null) {
      this.lights = Object.values(snapshot.val());     
      this.lights.forEach((light, i) => {
        this.lights[i].data.options.colorRemovable = false;
        this.lights[i].data.options.colorResetable = false;
        this.lights[i].data.options.expanded = false;
      })
    }
      viewReady(() => {
        if (drawerOpened.length > 0 && iconToggleEdits!==null) {
          iconToggleEdits.classList.add("hide");
        }
        this.loading = false;
      });
    })

    this.db.object('Rooms').snapshotChanges().subscribe(snapshot => {
      const result = snapshot.payload.val();
      if (result === null) { 
        this.rooms = [ "None" ];
        this.db.database.ref("Rooms").set(this.rooms);
        return;
      }
      this.rooms = Object.values(result);
       if (this.lights !== undefined) this.updateRooms();
    });
    
    this.db.object('Devices/Lights').snapshotChanges().subscribe(snapshot => {
      const result = snapshot.payload.val();
      if (result === null) {
        if (this.deleted) {
          this.lights = [];
          this.deleted = false;
          this.showEdits = false;
        }
        return;
      }

      const new_lights = Object.values(result);

      if (this.deleted) {
        this.lights = new_lights;
        this.deleted = false;
      }

      if (new_lights.length === 0) return
      if (this.lights.length !== new_lights.length) this.lights = new_lights;
      viewReady(() => {
        new_lights.find((light, i) => {
          this.lights[i].data.state = new_lights[i].data.state;
          this.lights[i].data.brightness = new_lights[i].data.brightness;
          this.lights[i].data.color = new_lights[i].data.color;
          this.lights[i].data.savedColors = new_lights[i].data.savedColors;
          this.lights[i].data.options.connected = new_lights[i].data.options.connected;
          if (!light.data.options.connected) {
            this.lights[i].data.options.expanded = false;
          }
          if (this.lights[i].data.options.expanded === undefined) this.lights[i].data.options.expanded = false;
        })
      })
    })
  }

  toggleLight(deviceId: string) {
    //this.hideDelete(deviceId);
    this.dtechMqtt.trigger("Lights", deviceId);
  }

  changeBrightness(deviceId: string, brightness: number) {
    //this.hideDelete(deviceId);
    this.dtechMqtt.changeBrightness(deviceId, brightness);
  }

  changeColor(deviceId: string, hex: string) {
    //this.hideDelete(deviceId);
    this.dtechMqtt.changeRGB(deviceId, hex);
  }

  selectColor(deviceId: string, color: string) {
    this.dtechMqtt.changeRGB(deviceId, color);
  }

  addColor(deviceId: string) {  
    this.lights.find((light) => {
      if (light.id === deviceId) {
        if (light.data.savedColors.length >= this.maxColorSaved) {
          this.snackbar.open("You can't add more colors", "Sorry!", {
            duration: 3000,
          });
          return;
        }
        const index = light.data.savedColors.indexOf(light.data.color);
        if (index >= 0) {
          this.snackbar.open("You already have this color", "Yeah", {
            duration: 3000,
          });
          return;
        }
        if (light.data.savedColors.length >= this.maxColorSaved) {
          this.snackbar.open("You can't add more colors", "Sorry!", {
            duration: 3000,
          });
          return;
        }
        light.data.savedColors = [...light.data.savedColors, light.data.color];
        this.db.object('Devices/Lights/' + deviceId + "/data").update({savedColors : light.data.savedColors});
        this.hideDelete(deviceId);
        return;
      };
    });   
  }

  showDelete(deviceId : string) {
    this.lights.find((light, i) => {
      if(light.id === deviceId) {
        this.lights[i].data.options.colorRemovable = true;
      }
    })
  }
  hideDelete(deviceId : string) {
    this.lights.find((light, i) => {
      if(light.id === deviceId) {
        this.lights[i].data.options.colorRemovable = false;
      }
    })
  }

  toggleRemoveColor(deviceId : string) {
    this.lights.find((light, i) =>{
      if(light.id === deviceId){
        this.lights[i].data.options.colorRemovable = !this.lights[i].data.options.colorRemovable;
      }
    })
    this.isDefaultColor(deviceId);
  }

  removeColor(deviceId: string, color: string): void {
    this.lights.find((light, i) => {
      if (light.id === deviceId) {
        const index = light.data.savedColors.indexOf(color);
        if (index >= 0) {
          light.data.savedColors.splice(index,1);
          this.db.object('Devices/Lights/' + deviceId + "/data").update({savedColors : light.data.savedColors});
          this.snackbar.open("Color deleted!", "Yes!", {
            duration: 3000,
          });
          this.lights[i].data.options.colorResetable = false;
          return;
        };
      }; 
    });
  }

  resetColor(deviceId: string) {
    this.lights.find((light, i) => {
      if (light.id === deviceId) {
        light.data.savedColors = this.defaultColors;
        this.db.object('Devices/Lights/' + deviceId + "/data").update({savedColors : light.data.savedColors});
        this.snackbar.open("Color palette reset!", "Done", {
          duration: 3000,
        });
        this.lights[i].data.options.colorResetable = false;
        return;
      };
    }); 
  }

  isDefaultColor(deviceId : string) {
    this.lights.find((light, i) => {
      if (light.id === deviceId) {   
        (JSON.stringify(light.data.savedColors)==JSON.stringify(this.defaultColors))
        ?this.lights[i].data.options.colorResetable = false
        :this.lights[i].data.options.colorResetable = true
        return;
      };
    });   
  }
  
  closeColors(deviceId : string) {
    this.hideDelete(deviceId);
  }

  formatLabel(value: number) {
    return value + '%';
  }

  toggleEdits() {
    this.showEdits = !this.showEdits;
    if (this.showEdits) {
      this.lights.forEach((light ,i) => {
        const expanded = this.lights[i].data.options.expanded;
        if (expanded) {
          this.saveIndexExpanded = i;
        }
        this.lights[i].data.options.expanded = false; 
      });
    } else {
      if (this.saveIndexExpanded !== undefined){
        this.lights[this.saveIndexExpanded].data.options.expanded = true;
        this.saveIndexExpanded = undefined;
      }
    }
  }

  openDialogEdit(selected_light : Light) {
    const dialogRef = this.dialog.open(DialogEditLightComponent, {
      data: {light: selected_light, rooms: this.rooms},
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result===undefined || result===false) return;
      this.lights.find((light,i) => {
        if (light.id === selected_light.id){
          const ref = this.db.object('Devices/Lights/' + light.id);
          if (result==="delete"){
            this.deleted = true;
            ref.remove().then(() => {
              this.snackbar.open("It will be auto-installed if re-connected", "Light deleted!", {
                duration: 3000,
              });
            });
            return;  
          }
          if (result.name !== ""){
            this.lights[i].name = result.name;
            ref.update({name : result.name});
          }
          if (result.room !== ""){
            this.lights[i].room = result.room;
            ref.update({room : result.room});
            console.log("changed room: " + result.room);
            
          } 
          if (result.transit !== ""){
            const transit = (result.transit === "true");
            this.lights[i].data.options.transit = transit;
            this.db.object('Devices/Lights/' + light.id + '/data/options').update({transit : transit});
          } 
          return;
        } 
      });
    });
  }

  openExpand(deviceId: string){
    this.lights.find((light, i) => {
      if (light.id === deviceId) {
        this.lights[i].data.options.expanded = true;
        this.lights[i].data.options.colorRemovable = false;
      }
    })
  }

  closeExpand(deviceId: string) {
    this.lights.find((light, i) => {
      if (light.id === deviceId) {
        this.lights[i].data.options.expanded = false;
      }
    })
  }

  emptyLights() {
    if (this.lights === undefined) return;
    if (this.lights.length === 0) return true;
    else return false;
  }

  updateRooms() {
    let exist = false;
    this.lights.forEach((light ,i) => {
      this.rooms.find(assignRoom => {
        if (assignRoom === light.room) {
          exist = true;
          return;
        }
      })
      if (!exist) {
        this.lights[i].room = "None";
        this.db.database.ref("Devices/Lights/" + light.id).update({room : "None"});
      }
    });
  }

}