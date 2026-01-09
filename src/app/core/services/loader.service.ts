import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {
    private _loading = signal<boolean>(false);

    readonly loading = this._loading.asReadonly();

    show() {
        this._loading.set(true);
    }

    hide() {
        this._loading.set(false);
    }
}
