import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

const assets = "../../assets/";

@Component({
  templateUrl: './signin-form.component.html',
  styleUrls: ['./signin-form.component.scss']
})

export class SigninFormComponent {
  GooglePlusImage = assets + "icons/google-plus.png";
  AccessIcon = assets + "icons/Logo.png";
  hide = true;
  loading = false;

  constructor(
    private router : Router, 
    private auth : AngularFireAuth,
    private snackbar: MatSnackBar) { }

  user = new FormGroup ({
    email : new FormControl('',[
      Validators.required,
      Validators.email,
    ]),
    password : new FormControl('', [
      Validators.required,
    ]),
  });

  login() {
    this.loading = true;
    
    this.auth.signInWithEmailAndPassword(this.user.get('email').value, this.user.get('password').value)
    .then(result => {
      this.loading = false;
      this.router.navigate(['core/home']);
    }).catch(err => {
        //console.log('Something went wrong:',err.message);
        this.loading = false;
        this.snackbar.open("Invalid Email or Password", "Try again!", {
          duration: 3000,
        });
      }); 
  };

  toggleHidePass(e) {
    e.preventDefault();
    this.hide = !this.hide;
  }
}

