import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class NavigationStateService {
    private _allowPlansAccess = false;

    constructor() { }

    allowPlansAccess() {
        this._allowPlansAccess = true;
    }

    isPlansAccessAllowed(): boolean {
        return this._allowPlansAccess;
    }

    clearPlansAccess() {
        this._allowPlansAccess = false;
    }
}
