import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { AppComponent } from '@app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';
import { RouterModule } from '@angular/router';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ServiceWorkerModule, SwRegistrationOptions } from '@angular/service-worker';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';

import { FIREBASE_CONFIG } from '@env/environment';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    SplashScreenComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    ScrollingModule,
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireDatabaseModule,
    ServiceWorkerModule.register('ngsw-worker.js')
  ],
  providers: [
    {
      provide: SwRegistrationOptions,
      useFactory: () => ({enabled: location.search.includes('sw=true')}),
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
