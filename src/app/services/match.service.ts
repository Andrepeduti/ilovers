import { Injectable, inject, effect } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';
import { ChatRealtimeService } from './chat-realtime.service';

export interface MatchProfile {
    id: string; // UserId
    matchId?: string; // The GUID of the match entity
    name: string;
    photo: string;
    isNew: boolean;
    chatId?: string;
    viewed?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MatchService {
    private matchesSubject = new BehaviorSubject<MatchProfile[]>([]);
    matches$ = this.matchesSubject.asObservable();
    private authService = inject(AuthService);
    private chatRealtimeService = inject(ChatRealtimeService);

    // Derived observable for count of NEW matches
    totalNew$ = this.matches$.pipe(
        map(matches => matches.filter(m => m.isNew).length)
    );

    constructor(private http: HttpClient) {
        // Automatically clear cache when user logs out or changes
        effect(() => {
            const user = this.authService.currentUser();
            if (!user) {
                this.clearCache();
            }
        });

        // Listen for new matches
        this.chatRealtimeService.matchReceived$.subscribe(() => {
            this.fetchMatches().subscribe();
        });

        // Listen for messages (to remove match from 'New' if convo starts)
        this.chatRealtimeService.messageReceived$.subscribe(() => {
            this.fetchMatches().subscribe();
        });
    }

    clearCache() {
        this.matchesSubject.next([]);
    }

    fetchMatches(): Observable<MatchProfile[]> {
        return this.http.get<any>(`${environment.apiUrl}/interactions/matches`).pipe(
            map(response => {
                const items = response.value || response.data || response;
                if (Array.isArray(items)) {
                    return items.map((m: any) => ({
                        id: m.userId,
                        matchId: m.matchId,
                        name: m.name,
                        photo: m.photoUrl,
                        isNew: m.isNew, // Backend now maps this from (currentUser == UserA && !UserAViewed)
                        chatId: m.chatId,
                        viewed: !m.isNew
                    }));
                }
                return [];
            }),
            tap(matches => {
                this.matchesSubject.next(matches);
            })
        );
    }

    addMatch(profile: MatchProfile) {
        const currentMatches = this.matchesSubject.value;
        if (!currentMatches.find(m => m.id === profile.id)) {
            this.matchesSubject.next([profile, ...currentMatches]);
        }
    }

    markAsViewed(userId: string) {
        // Optimistic update
        const currentMatches = this.matchesSubject.value;
        const index = currentMatches.findIndex(m => m.id === userId);

        if (index !== -1 && currentMatches[index].isNew) {
            const match = currentMatches[index];
            const updated = [...currentMatches];
            updated[index] = { ...match, isNew: false, viewed: true };
            this.matchesSubject.next(updated);

            // Access matchId to call backend
            if (match.matchId) {
                this.persistView(match.matchId);
            }
        }
    }

    // Call backend to persist
    persistView(matchId: string) {
        return this.http.post(`${environment.apiUrl}/interactions/matches/${matchId}/view`, {}).subscribe();
    }

    getMatches() {
        return this.matchesSubject.getValue();
    }
}
