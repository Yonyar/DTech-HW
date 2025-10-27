import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
const assets = "../../assets/";

@Component({
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss']
})
export class SignupFormComponent {

  GooglePlusImage = assets + "icons/google-plus.png";
  AccessIcon = assets + "icons/access.png";
  password = '';
  user = '';

  userFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

}
