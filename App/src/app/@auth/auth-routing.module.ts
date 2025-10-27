import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SigninFormComponent } from '@app/@auth/signin-form/signin-form.component';
import { SignupFormComponent } from '@app/@auth/signup-form/signup-form.component';

const routes: Routes = [
  {
    path: 'login', component: SigninFormComponent
  },
  {
    path: 'register', component: SignupFormComponent
  },
  {
    path: '',
    children: [
      {
        path: 'login',
        loadChildren: () => import('@app/@auth/auth.module').then(c => c.AuthModule)
      },
      {
        path: 'register',
        loadChildren: () => import('@app/@auth/auth.module').then(c => c.AuthModule)
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class AuthRoutingModule { }
