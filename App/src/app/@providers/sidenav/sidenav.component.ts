import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { DialogLogoutComponent } from '@app/@providers/sidenav/dialogs/dialog-logout/dialog-logout.component';
import * as Hammer from 'hammerjs';
import { disableScroll } from '@app/@shared/utils/scroll-lock';

const assets = "../assets/";

@Component({
  selector: 'dtech-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})

export class SidenavComponent implements OnInit {
  @ViewChild('drawer') private drawer: MatDrawer;

  LogoIcon = assets + "icons/Logo.png";
  showFiller = false;
  blured = false;
  hammering = true;

  constructor(private router: Router, public auth: AngularFireAuth, public dialog: MatDialog){
  }

  ngOnInit(): void {
    disableScroll();
    const hammer = Hammer(document.body);
    hammer.threshold = 3;

    document.body.addEventListener('mousedown', event => this.handleSidenav(event.target));
    document.body.addEventListener('touchstart', event => this.handleSidenav(event.target));
    
    Hammer(document.body).on("panright", (event: { target: { className: string; }; }) => {
      if (!this.drawer.opened && !this.avoidSlide(event.target.className)) {
        this.hammering = false;
        this.openMenu();
        setTimeout(() => {
          this.hammering = true;
        }, 500);
      }
    });

    Hammer(document.body).on("panleft", (event: { target: { className: string; }; }) => {
      if (this.drawer.opened && !this.avoidSlide(event.target.className)) {
        this.hammering = false;
        this.closeMenu();
        setTimeout(() => {
          this.hammering = true;
        }, 500);
      }
    });
  }

  toggleMenu() {
    this.drawer.opened?this.closeMenu():this.openMenu();
  }

  openMenu() {
    const element = document.getElementById("nav-icon");
    const edit = document.getElementById("icon-toggleEdits");
    element.classList.toggle("closed");
    if (edit !== null) edit.classList.add("hide");
    this.drawer.open();
    this.blured = true;
  }

  closeMenu() {
    const element = document.getElementById("nav-icon");
    const edit = document.getElementById("icon-toggleEdits");
    element.classList.toggle("closed");
    if (edit !== null) edit.classList.remove("hide");
    this.drawer.close();
    this.blured = false;
  }

  openDialogLogout() {
    this.closeMenu();
    const dialogRef = this.dialog.open(DialogLogoutComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.logout();
    });
  }

  logout() {
    if (this.auth.signOut()){
      this.router.navigate(['auth/login']);
    }
  }
  
  avoidSlide(className: string | string[]) {        
    if (className == undefined || className == ""){
      return false;
    }
    if (
      className.includes("mat-slider") ||
      className.includes("color-hue") ||
      className.includes("swatch") ||
      className.includes("iconSwitch") ||
      className.includes("mat-dialog-container") ||
      className.includes("mat-dialog-content") ||
      className.includes("mat-dialog-actions") ||
      className.includes("cdk-overlay-backdrop"))
    {
      return true;
    }
    return false;
  }

  handleSidenav(target: EventTarget) {
    const htmlElement = <HTMLElement>target;   
    if (this.drawer.opened && 
      !this.avoidSlide(htmlElement.className) && 
      htmlElement.tagName === 'MAT-DRAWER-CONTENT' ||
      htmlElement.tagName === 'APP-ROOT') this.closeMenu();
  }
}
