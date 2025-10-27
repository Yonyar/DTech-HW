import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';

import {MatIconModule} from '@angular/material/icon';
import { LibraryComponent } from './library/library.component';
import { SnappiesComponent } from './snappies/snappies.component';

@NgModule({
  declarations: [
    HomeComponent, 
    LibraryComponent, 
    SnappiesComponent
  ],
  imports: [
    CommonModule,
    MatIconModule
  ]
})
export class HomeModule { }
