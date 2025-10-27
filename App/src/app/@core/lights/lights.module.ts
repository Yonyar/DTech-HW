import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@app/@core/core.module';

import { LightsComponent } from './lights.component';
import { LightCardComponent } from './light-card/light-card.component';
import { DialogEditLightComponent } from './dialogs/dialog-edit/dialog-edit-light.component'
import { DialogEditRoomComponent } from './dialogs/dialog-edit/dialog-edit-room.component'

import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { ColorHueModule } from 'ngx-color/hue';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    LightsComponent,  
    LightCardComponent,
    DialogEditLightComponent,
    DialogEditRoomComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    MatExpansionModule,
    MatSliderModule,
    MatChipsModule,
    ColorHueModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule
  ]
})
export class LightsModule { }
