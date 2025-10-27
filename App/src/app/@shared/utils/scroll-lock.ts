const $body = document.querySelector('body');
//const container = document.getElementById('container');
//const content = document.getElementById('content');

let scrollPosition = 0;

export function disableScroll() {
    scrollPosition = window.pageYOffset;
    $body.style.overflow = 'hidden';
//   container.style.overflowY = 'hidden';
//    content.style.overflowY = 'hidden';
    $body.style.position = 'fixed';
    $body.style.top = `-${scrollPosition}px`;
    $body.style.width = '100%';
}

export function enableScroll() {
    $body.style.removeProperty('overflow');
//    container.style.removeProperty('overflowY');
//    content.style.removeProperty('overflowY');
    $body.style.removeProperty('position');
    $body.style.removeProperty('top');
    $body.style.removeProperty('width');
    window.scrollTo(0, scrollPosition);
}