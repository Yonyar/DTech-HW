import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Switch } from '@app/models/switch.model';
import { CarouselItemComponent } from '../carousel-item/carousel-item.component';
import { viewReady } from '@app/@shared/utils/view-state';
import { scaleAnimation, positionAnimation, opacityAnimation } from '@app/@shared/utils/animations';
import { AngularFireDatabase } from '@angular/fire/database';
import * as Hammer from 'hammerjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dtech-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {

  @ViewChildren(CarouselItemComponent) carouselItems: QueryList<CarouselItemComponent>
  subscriptionSwitches: Subscription;
  switches: Array<Switch>;
  private currentCarouselIndex: number = 0;
  disableNext : boolean = false;
  disablePrev : boolean = true;

  public selectedElement: HTMLElement;
  private prevElement: HTMLElement;
  private nextElement: HTMLElement;

  private readonly cssParams = {
    prevElement: {
      position: 20,
      scale: 70,
      opacity: 0.7
    },
    selectedElement: {
      position: 50,
      scale: 100,
      opacity: 1
    },
    nextElement: {
      position: 80,
      scale: 70,
      opacity: 0.7
    }
  }

  loading = true;
  hammering = true;
  showEdits = false;

  constructor(private db : AngularFireDatabase) {}

  ngOnInit() {  
    this.db.database.ref('Devices/Switches').once("value", snapshot => {
      const result = snapshot.val();
      if (result === null || result === undefined){
        this.loading = false;
        return;
      }
      this.switches = Object.values(result);
      this.loading = false;
      if (Object.values(result).length < this.switches.length) {
        if (this.currentCarouselIndex === 0) this.incrementCurrentCarouselIndex;
        else this.decreaseCurrentCarouselIndex();
      }
      viewReady(() => {      
        this.loading = false;
        this.updateDirectionButtons();
        this.updateElementsRoles();
        this.hideItemsFarAway();
        this.setupCarouselItemsPosition();
      });
    })

    this.subscriptionSwitches = this.db.object('Devices/Switches').snapshotChanges().subscribe(snapshot => {
      const result = snapshot.payload.val();
      
      if (result === null || result === undefined){
        this.updateDirectionButtons();
        this.switches = undefined;
        return;
      } 
      
      this.switches = Object.values(result);
      if (this.switches.length === 0) return;

      viewReady(() => {
        if (Object.values(result).length < this.switches.length) {
          if (this.currentCarouselIndex === 0) this.incrementCurrentCarouselIndex;
          else this.decreaseCurrentCarouselIndex();
        }
          this.updateDirectionButtons();
          this.updateElementsRoles();
          this.hideItemsFarAway();
          this.setupCarouselItemsPosition();
      });
    });

    const hammer = Hammer(document.body);
    hammer.threshold = 10;

    hammer.on("panright", (event: { target: { className: string; }; }) => {
      if (this.hammering && event.target.className==="iconSwitch" && !this.disablePrev) {
        this.hammering = false;
        this.goPrev();
        setTimeout(() => {
          this.hammering = true;
        }, 500);
      }
    });
    hammer.on("panleft", (event: { target: { className: string; }; }) => {
      if (this.hammering && event.target.className==="iconSwitch" && !this.disableNext) {
        this.hammering = false;
        this.goNext();
        setTimeout(() => {
          this.hammering = true;
        }, 500);
      }
    });
  }

  ngOnDestroy() {
    this.subscriptionSwitches.unsubscribe();
  }

  updateElementsRoles() {
    const allItems = this.carouselItems.toArray();
    if (allItems[this.currentCarouselIndex] !== undefined) {  
      this.selectedElement = document.getElementById(allItems[this.currentCarouselIndex].id.toString());
    }
    if (this.currentCarouselIndex - 1 >= 0) {
      this.prevElement = document.getElementById(allItems[this.currentCarouselIndex - 1].id.toString());
    } else this.prevElement = undefined;
    if (this.currentCarouselIndex + 1 <= allItems.length - 1) {
      this.nextElement = document.getElementById(allItems[this.currentCarouselIndex + 1].id.toString());
    } else this.nextElement = undefined;
  }

  hideItemsFarAway() {        
    this.carouselItems.toArray().forEach((item, index) => {
      const htmlElement = document.getElementById(item.id.toString())
      const isPrevElement = htmlElement === this.prevElement;
      const isNextElement = htmlElement === this.nextElement;
      const canHidde = !isPrevElement && index !== this.currentCarouselIndex && !isNextElement

      if (htmlElement === null) return;
      if (canHidde) htmlElement.style.display = 'none';
      else htmlElement.style.display = 'block';
    });
  }

  setupCarouselItemsPosition() {
    if (this.prevElement !== undefined) {
      this.prevElement.style.left = this.cssParams.prevElement.position + '%';
      Array
        .from(this.prevElement.children)
        .forEach(element => 
          (<HTMLElement>element).style.width = this.cssParams.prevElement.scale + '%');
      this.prevElement.style.opacity = this.cssParams.prevElement.opacity.toString();
    }
    
    if (this.selectedElement !== undefined) {      
      this.selectedElement.style.left = this.cssParams.selectedElement.position + '%';
      Array
        .from(this.selectedElement.children)
        .forEach(element => 
          (<HTMLElement>element).style.width = this.cssParams.selectedElement.scale + '%');
      this.selectedElement.style.opacity = this.cssParams.selectedElement.opacity.toString();
    }
    
    if (this.nextElement !== undefined) {
      this.nextElement.style.left = this.cssParams.nextElement.position + '%';
      Array
        .from(this.nextElement.children)
        .forEach(
          element => (<HTMLElement>element).style.width = this.cssParams.nextElement.scale + '%');
      this.nextElement.style.opacity = this.cssParams.nextElement.opacity.toString();
    }
  }

  moveFowardAnimation() {
    if (this.prevElement !== undefined) {
      positionAnimation(this.prevElement, this.cssParams.selectedElement.position, this.cssParams.prevElement.position);
      Array
        .from(this.prevElement.children)
        .forEach(element => 
          scaleAnimation(<HTMLElement>element, this.cssParams.selectedElement.scale, this.cssParams.prevElement.scale));
      opacityAnimation(this.prevElement, this.cssParams.selectedElement.opacity, this.cssParams.prevElement.opacity);
    }
    
    if (this.selectedElement !== undefined) {
      positionAnimation(this.selectedElement, this.cssParams.nextElement.position, this.cssParams.selectedElement.position);
      Array
        .from(this.selectedElement.children)
        .forEach(element => 
          scaleAnimation(<HTMLElement>element, this.cssParams.nextElement.scale, this.cssParams.selectedElement.scale));
      opacityAnimation(this.selectedElement, this.cssParams.nextElement.opacity, this.cssParams.selectedElement.opacity);
    }
    
    if (this.nextElement !== undefined) {
      Array
        .from(this.nextElement.children)
        .forEach(element => 
          (<HTMLElement>element).style.width = this.cssParams.nextElement.scale + '%');
      positionAnimation(this.nextElement, this.cssParams.nextElement.position + 20, this.cssParams.nextElement.position);
      opacityAnimation(this.nextElement, 0, this.cssParams.nextElement.opacity);
    }
  }

  moveBackwardAnimation() {
    if (this.prevElement !== undefined) {
      positionAnimation(this.prevElement, this.cssParams.prevElement.position - 20, this.cssParams.prevElement.position);
      Array
        .from(this.prevElement.children)
        .forEach(element => 
          (<HTMLElement>element).style.width = this.cssParams.prevElement.scale + '%');
      opacityAnimation(this.prevElement, 0, this.cssParams.prevElement.opacity);
    }
    
    if (this.selectedElement !== undefined) {
      positionAnimation(this.selectedElement, this.cssParams.prevElement.position, this.cssParams.selectedElement.position);
      Array
        .from(this.selectedElement.children)
        .forEach(element => 
          scaleAnimation(<HTMLElement>element, this.cssParams.prevElement.scale, this.cssParams.selectedElement.scale));
      opacityAnimation(this.selectedElement, this.cssParams.selectedElement.opacity, this.cssParams.selectedElement.opacity);
    }
    
    if (this.nextElement !== undefined) {
      positionAnimation(this.nextElement, this.cssParams.selectedElement.position, this.cssParams.nextElement.position);
      Array
        .from(this.nextElement.children)
        .forEach(element => 
          scaleAnimation(<HTMLElement>element, this.cssParams.selectedElement.scale, this.cssParams.nextElement.scale));
      opacityAnimation(this.nextElement, this.cssParams.selectedElement.opacity, this.cssParams.nextElement.opacity);
    }
  }

  goNext() {
    if (this.switches===undefined || this.switches===null) return;
    this.incrementCurrentCarouselIndex();
    this.updateElementsRoles();
    this.moveFowardAnimation();
    this.hideItemsFarAway();
    this.updateDirectionButtons();
  }

  goPrev() {
    if (this.switches===undefined || this.switches===null) return;
    this.decreaseCurrentCarouselIndex();
    this.updateElementsRoles();
    this.moveBackwardAnimation()
    this.hideItemsFarAway();
    this.updateDirectionButtons();
  }

  updateDirectionButtons() {       
    if (this.switches===undefined || this.switches===null || this.switches === []) {
      this.disableNext = true;
      this.disablePrev = true;
    } else {
      if (this.currentCarouselIndex === 0) this.disablePrev = true;
      if (this.currentCarouselIndex === this.switches.length - 1) this.disableNext = true;
      if (this.currentCarouselIndex > 0) this.disablePrev = false;
      if (this.currentCarouselIndex < this.switches.length -1) this.disableNext = false;
    }
  }

  incrementCurrentCarouselIndex() {
    if (this.currentCarouselIndex === this.switches.length - 1) this.currentCarouselIndex = 0;
    else this.currentCarouselIndex += 1;
  }

  decreaseCurrentCarouselIndex() {
    if (this.currentCarouselIndex === 0) this.currentCarouselIndex = this.switches.length - 1;
    else this.currentCarouselIndex -= 1;
  }

  mapLinks(mySwitch: Switch) {
    if (mySwitch.data === undefined || mySwitch.data === null) return false;
    else if (mySwitch.data.lightLinks === undefined || mySwitch.data.lightLinks === null) return false

    return mySwitch.data.lightLinks;
  }

  toggleEdits() {
    this.showEdits = !this.showEdits;
  }

  emptySwitches() {
    if (this.switches === undefined) return true;
    if (this.switches.length >= 0) return false;
  }

}
