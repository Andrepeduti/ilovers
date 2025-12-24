import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiPaths } from '../enums/api-paths.enum';
import { FeedProfile } from '../models/feed.interface';
import { MOCK_FEED_PROFILES } from '../mocks/feed.mock';
import { delay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FeedService {

    constructor(private http: HttpClient) { }

    getProfiles(): Observable<FeedProfile[]> {
        if (!environment.production) {
            console.log('FeedService: getProfiles using MOCK data');
            return of(MOCK_FEED_PROFILES).pipe(delay(500));
        }
        return this.http.get<FeedProfile[]>(`${environment.apiUrl}${ApiPaths.FEED}`);
    }

    action(profileId: number, actionType: 'like' | 'pass' | 'superlike'): Observable<{ success: boolean, match?: boolean }> {
        if (!environment.production) {
            console.log(`FeedService: action(${actionType}) on ${profileId} using MOCK data`);
            // Randomly simulate a match on 'like' or 'superlike'
            const isMatch = (actionType !== 'pass') && Math.random() > 0.7;
            return of({ success: true, match: isMatch }).pipe(delay(300));
        }
        return this.http.post<{ success: boolean, match?: boolean }>(`${environment.apiUrl}${ApiPaths.FEED}/action`, { profileId, actionType });
    }
}
