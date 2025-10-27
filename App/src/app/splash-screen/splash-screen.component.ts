import { 
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
    trigger,
    transition,
    query,
    animateChild,
    animate,
    style
} from '@angular/animations';
import { PwaService } from '@app/@providers/pwa.service';

@Component({
  selector: 'dtech-splash-screen',
  templateUrl: './splash-screen.component.html',
  animations: [
    trigger('hide', [
      transition(':leave', [
        query(':leave', animateChild(), {optional: true}),
        animate('0ms 800ms', style({opacity: 0}))
      ]),
    ]),
    trigger('fadeOut', [
      transition(':leave', [
        query(':leave', animateChild(), {optional: true}),
        animate(400, style({opacity: 0.8, width: 0, height: 0}))
      ]),
    ]),
    trigger('fadeOutLate', [
      transition(':leave', [
        query(':leave', animateChild(), {optional: true}),
        animate(400, style({opacity: 0}))
      ]),
    ]),
    trigger('borderIn', [
      transition(':leave', [
        query(':leave', animateChild(), {optional: true}),
        animate(800, style({border: '130em solid #e3e3e3', backgroundColor: '#e3e3e3'})),
      ]),
    ])
  ],
  styleUrls: ['./splash-screen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplashScreenComponent implements OnInit {
  show = true;

  constructor(
      private pwaService: PwaService,
      private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.pwaService.checkForUpdate()
      .subscribe(result => {
        this.show = result;
        this.pwaService.changeCurrentUpdate(result);
        this.cdr.detectChanges();
      });
  }
}