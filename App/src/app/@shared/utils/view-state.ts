import { FunctionCall } from '@angular/compiler';

export function viewReady(callback: Function) {   
    setTimeout(callback);
}