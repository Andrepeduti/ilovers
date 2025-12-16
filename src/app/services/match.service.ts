import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MatchProfile {
    id: number;
    name: string;
    photo: string;
    viewed?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MatchService {
    private matchesSubject = new BehaviorSubject<MatchProfile[]>([]);
    matches$ = this.matchesSubject.asObservable();

    constructor() { }

    addMatch(profile: MatchProfile) {
        const currentMatches = this.matchesSubject.value;
        // Prevent duplicates
        if (!currentMatches.find(m => m.id === profile.id)) {
            this.matchesSubject.next([profile, ...currentMatches]);
        }
    }

    getMatches() {
        return this.matchesSubject.getValue();
    }
}
