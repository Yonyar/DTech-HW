import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

import { PageNotFoundComponent } from '@app/page-not-found/page-not-found.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['auth/login']);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'core/home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('@app/@auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'core', 
    ...canActivate(redirectUnauthorizedToLogin),
    loadChildren: () => import('@app/@core/core.module').then(m => m.CoreModule)
  },
  { path: '404', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'disabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
