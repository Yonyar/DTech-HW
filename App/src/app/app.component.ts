import { Component, OnInit } from '@angular/core';
import NET from 'vanta/dist/vanta.net.min';

@Component({
  selector: 'app-wrapper',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  effect: NET;

  constructor() { }

  ngOnInit() {  
    const elementBody = document.querySelector('body');

    elementBody.addEventListener("mousemove", (e) => {
      //if (e.pageX > 10 && e.pageX < window.innerWidth - 10) return;
      e.preventDefault();
    });

    document.body.style.top = `-${window.scrollY}px`;

    this.effect = NET({
      el: "#net-background",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x536d93,
      backgroundColor: 0xe3e3e3,
      points: 6.00,
      maxDistance: 14.00,
      spacing: 14.00
    });
  }

}