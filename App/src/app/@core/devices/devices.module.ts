import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@app/@core/core.module';

import { DevicesComponent } from './devices.component';
import { RoomsComponent } from './rooms/rooms.component';
import { DevicesListComponent } from './devices-list/devices-list.component';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    DevicesComponent, 
    RoomsComponent, 
    DevicesListComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    MatProgressSpinnerModule,
    DragDropModule
  ]
})
export class DevicesModule { }
