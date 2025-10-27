import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

import { HomeComponent } from '@app/@core/home/home.component';
import { DevicesComponent } from '@app/@core/devices/devices.component';
import { LightsComponent } from '@app/@core/lights/lights.component';
import { SwitchesComponent } from '@app/@core/switches/switches.component';
import { BlindsComponent } from '@app/@core/blinds/blinds.component';
import { GarageComponent } from '@app/@core/garage/garage.component';
import { CoreComponent } from './core.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const routes: Routes = [
  {
    path: '',
    component: CoreComponent, ...canActivate(redirectUnauthorizedToLogin),
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'devices', component: DevicesComponent },
      { path: 'lights', component: LightsComponent },
      { path: 'switches', component: SwitchesComponent },
      { path: 'blinds', component: BlindsComponent },
      { path: 'garage', component: GarageComponent }
    ]
  },
  {
    path: 'home',
    loadChildren: () => import('@app/@core/home/home.module').then(c => c.HomeModule),
  },
  {
    path: 'devices',
    loadChildren: () => import('@app/@core/devices/devices.module').then(c => c.DevicesModule),
  },
  {
    path: 'lights',
    loadChildren: () => import('@app/@core/lights/lights.module').then(c => c.LightsModule),
  },
  {
    path: 'switches',
    loadChildren: () => import('@app/@core/switches/switches.module').then(c => c.SwitchesModule),
  },
  {
    path: 'blinds',
    loadChildren: () => import('@app/@core/blinds/blinds.module').then(c => c.BlindsModule),
  },
  {
    path: 'garage',
    loadChildren: () => import('@app/@core/garage/garage.module').then(c => c.GarageModule),
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class CoreRoutingModule { }
