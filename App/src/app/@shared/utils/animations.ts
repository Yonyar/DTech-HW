const animationSpeed = 10;

export function scaleAnimation(htmlElement: HTMLElement, sizeStart: number, sizeEnd: number) {
    let width = sizeStart;
    (<HTMLElement>htmlElement).style.width = sizeStart + '%';
    const scaleInterval = setInterval(setScale, animationSpeed);

    function setScale() {
      if (sizeStart === sizeEnd) return;
      else if (sizeStart > sizeEnd) {
        width -= 2;
        if (width <= sizeEnd) clearInterval(scaleInterval);
      } else {
        width += 2;
        if (width >= sizeEnd) clearInterval(scaleInterval);
      }
      
      (<HTMLElement>htmlElement).style.width = width + '%';
    }
}

export function positionAnimation(htmlElement: HTMLElement, leftStart: number, leftEnd: number) {
    let left = leftStart;
    (<HTMLElement>htmlElement).style.left = leftStart + '%';
    const positionInterval = setInterval(setPosition, animationSpeed);

    function setPosition() {
      if (leftStart === leftEnd) return;
      else if (leftStart > leftEnd) {
        left -= 2;
        if (left <= leftEnd) clearInterval(positionInterval);
      } else {
        left += 2;
        if (left >= leftEnd) clearInterval(positionInterval);
      }
      
      (<HTMLElement>htmlElement).style.left = left + '%';
    }
}

export function opacityAnimation(htmlElement: HTMLElement, opacityStart: number, opacityEnd: number) {
    let opacity = opacityStart;
    (<HTMLElement>htmlElement).style.opacity = opacityStart.toString();
    const opacityInterval = setInterval(setOpacity, animationSpeed);

    function setOpacity() {
      if (opacityStart === opacityEnd) return;
      else if (opacityStart > opacityEnd) {
        opacity -= 0.0625;
        if (opacity <= opacityEnd) clearInterval(opacityInterval);
      } else {
        opacity += 0.0625;
        if (opacity >= opacityEnd) clearInterval(opacityInterval);
      }
      
      (<HTMLElement>htmlElement).style.opacity = opacity.toString();
    }
}