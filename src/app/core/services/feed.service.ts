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
}
