import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CoreComponent } from '@app/@core/core.component';
import { SnackbarComponent } from '@app/@shared/components/snackbar/snackbar.component';
import { CoreRoutingModule } from '@app/@core/core-routing.module';
import { SidenavModule } from '@app/@providers/sidenav/sidenav.module';

import { MqttModule, MqttService } from 'ngx-mqtt';
import { MQTT_SERVICE_OPTIONS } from '@env/environment';
import { DtechMqttService } from '@app/@providers/dtech-mqtt.service';

import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    CoreComponent
  ],
  imports: [
    CommonModule,
    CoreRoutingModule,
    RouterModule,
    SidenavModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  providers: [
    SnackbarComponent,
    MqttService,
    DtechMqttService,
  ],
  bootstrap: [CoreComponent],
  exports: [
    MatButton,
    MatIcon
  ]
})
export class CoreModule {}
