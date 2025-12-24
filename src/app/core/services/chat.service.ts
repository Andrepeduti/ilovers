import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiPaths } from '../enums/api-paths.enum';
import { Conversation, Match } from '../models/chat.interface';
import { MOCK_CONVERSATIONS, MOCK_MATCHES } from '../mocks/chat.mock';
import { delay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    constructor(private http: HttpClient) { }

    getConversations(): Observable<Conversation[]> {
        if (!environment.production) {
            console.log('ChatService: getConversations using MOCK data');
            return of(MOCK_CONVERSATIONS).pipe(delay(500));
        }
        return this.http.get<Conversation[]>(`${environment.apiUrl}${ApiPaths.CONVERSATIONS}`);
    }

    getNewMatches(): Observable<Match[]> {
        if (!environment.production) {
            console.log('ChatService: getNewMatches using MOCK data');
            return of(MOCK_MATCHES).pipe(delay(500));
        }
        return this.http.get<Match[]>(`${environment.apiUrl}${ApiPaths.MATCHES}`);
    }

    reportUser(userId: number, reason: string): Observable<void> {
        if (!environment.production) {
            console.log(`ChatService: reportUser(${userId}, "${reason}") using MOCK data`);
            return of(void 0).pipe(delay(1000));
        }
        return this.http.post<void>(`${environment.apiUrl}${ApiPaths.REPORT}`, { userId, reason });
    }

    unmatchUser(userId: number): Observable<void> {
        if (!environment.production) {
            console.log(`ChatService: unmatchUser(${userId}) using MOCK data`);
            return of(void 0).pipe(delay(800));
        }
        return this.http.post<void>(`${environment.apiUrl}${ApiPaths.UNMATCH}`, { userId });
    }
}
