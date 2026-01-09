import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';
import { FeedProfile, InteractionResponse } from '../models/feed.interface';

@Injectable({
    providedIn: 'root'
})
export class FeedService {
    private apiUrl = `${environment.apiUrl}/feed`;

    constructor(private http: HttpClient) { }

    getFeed(limit: number = 10): Observable<FeedProfile[]> {
        return this.http.get<{ data: FeedProfile[] }>(`${this.apiUrl}?limit=${limit}`)
            .pipe(map(response => response.data));
    }

    like(targetProfileId: string): Observable<InteractionResponse> {
        return this.http.post<{ data: InteractionResponse }>(`${this.apiUrl}/like`, { targetProfileId })
            .pipe(map(response => response.data));
    }

    dislike(targetProfileId: string): Observable<InteractionResponse> {
        return this.http.post<{ data: InteractionResponse }>(`${this.apiUrl}/dislike`, { targetProfileId })
            .pipe(map(response => response.data));
    }

    superLike(targetProfileId: string): Observable<InteractionResponse> {
        return this.http.post<{ data: InteractionResponse }>(`${this.apiUrl}/super-like`, { targetProfileId })
            .pipe(map(response => response.data));
    }

    getLimits(): Observable<{ likesRemaining: number, superLikesRemaining: number, rewindsRemaining: number }> {
        return this.http.get<{ data: any }>(`${this.apiUrl}/limits`)
            .pipe(map(response => response.data));
    }

    rewind(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/rewind`, {});
    }
    // State Persistence
    private savedProfiles: FeedProfile[] = [];
    private savedIndex: number = 0;

    saveState(profiles: FeedProfile[], index: number) {
        this.savedProfiles = profiles;
        this.savedIndex = index;
    }

    getState(): { profiles: FeedProfile[], index: number } | null {
        if (this.savedProfiles.length > 0) {
            return { profiles: this.savedProfiles, index: this.savedIndex };
        }
        return null;
    }

    clearState() {
        this.savedProfiles = [];
        this.savedIndex = 0;
    }
}
