import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlindCardComponent } from './blind-card/blind-card.component';
import { BlindsComponent } from './blinds.component';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [BlindCardComponent, BlindsComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class BlindsModule { }
