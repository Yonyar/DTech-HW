import {
    Injectable,
    ApplicationRef
} from "@angular/core";
import {
    first,
    switchMap,
    mapTo,
    timeout,
    catchError
} from 'rxjs/operators';
import { Observable, from, timer, of } from 'rxjs';
import { SwUpdate } from "@angular/service-worker";

@Injectable({
    providedIn: 'root'
})
export class PwaService {

    private currentUpdate = false;

    constructor(
        private appRef: ApplicationRef,
        private swUpdate: SwUpdate) {
        if (this.swUpdate.isEnabled) {
            this.appRef.isStable.pipe(
                first(isStable => isStable === true),
                switchMap(() => this.swUpdate.available)).subscribe(() => {
                    this.swUpdate.activateUpdate().then(() => document.location.reload());
                });
        }
    }

    isCurrentUpdate(): boolean {
        return this.currentUpdate
    }

    changeCurrentUpdate(currentUpdate: boolean): void {
        this.currentUpdate = currentUpdate;
    }

    checkForUpdate(): Observable<any> {
        const waitFor = 1000;

        if (this.swUpdate.isEnabled) {
            const available$ = this.swUpdate.available.pipe(
                mapTo(true),
                timeout(waitFor),
                catchError(() => of(false)));

            return from(this.swUpdate.checkForUpdate()).pipe(
                switchMap(() => available$));
        }

        return timer(waitFor).pipe(mapTo(false));
    }
}
