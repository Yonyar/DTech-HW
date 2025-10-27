import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})

export class SnackbarComponent  {

  timeOut = 1500;

  constructor(
    public snackBar: MatSnackBar
  ) { }


  openSnackBar(message, action: string, className: string) {

    if ( message instanceof Array) {

        message.forEach( (message, index) => {

            setTimeout(() => {
              
                this.snackBar.open(message.text, action, {
                    duration: this.timeOut,
                    verticalPosition: 'bottom', // 'top' | 'bottom'
                    horizontalPosition: 'center', //'start' | 'center' | 'end' | 'left' | 'right'
                    panelClass: [className],
                });
                

            }, index * (this.timeOut+500)); // 500 => timeout between two messages

        });


    } else {

      this.snackBar.open(message.text, action, {
        duration: this.timeOut,
        verticalPosition: 'bottom', // 'top' | 'bottom'
        horizontalPosition: 'center', //'start' | 'center' | 'end' | 'left' | 'right'
        panelClass: [className],
      });

    }


  }


}