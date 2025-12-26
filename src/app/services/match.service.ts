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
    isSuperLike?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MatchService {
    private matchesSubject = new BehaviorSubject<MatchProfile[]>([]);
    matches$ = this.matchesSubject.asObservable();

    private superLikesSubject = new BehaviorSubject<MatchProfile[]>([]);
    superLikes$ = this.superLikesSubject.asObservable();

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
            this.fetchSuperLikes().subscribe();
        });

        // Listen for messages (to remove match from 'New' if convo starts)
        this.chatRealtimeService.messageReceived$.subscribe(() => {
            this.fetchMatches().subscribe();
        });
    }

    clearCache() {
        this.matchesSubject.next([]);
        this.superLikesSubject.next([]);
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
                        viewed: !m.isNew,
                        isSuperLike: m.isSuperLike
                    }));
                }
                return [];
            }),
            tap(matches => {
                this.matchesSubject.next(matches);
            })
        );
    }

    fetchSuperLikes(): Observable<MatchProfile[]> {
        return this.http.get<any>(`${environment.apiUrl}/interactions/super-likes`).pipe(
            map(response => {
                const items = response.value || response.data || response;
                if (Array.isArray(items)) {
                    return items.map((m: any) => ({
                        id: m.fromUserId,
                        name: m.fromUserName,
                        photo: m.fromUserPhoto,
                        isNew: true, // Super Likes are conceptually always "new" until acted upon?
                        matchId: m.interactionId // InteractionId
                    }));
                }
                return [];
            }),
            tap(sl => this.superLikesSubject.next(sl))
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

    unmatch(matchId: string): Observable<any> {
        return this.http.post(`${environment.apiUrl}/interactions/matches/${matchId}/unmatch`, {}).pipe(
            tap(() => {
                // Remove from local cache
                const currentMatches = this.matchesSubject.value;
                const updated = currentMatches.filter(m => m.matchId !== matchId && m.chatId !== matchId); // matchId vs chatId confusion, filter both
                this.matchesSubject.next(updated);
            })
        );
    }

    removeSuperLike(userId: string) {
        const current = this.superLikesSubject.value;
        const updated = current.filter(s => s.id !== userId);
        this.superLikesSubject.next(updated);
    }

    getMatches() {
        return this.matchesSubject.getValue();
    }
}
