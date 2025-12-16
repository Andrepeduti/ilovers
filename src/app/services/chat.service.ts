import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Conversation, Match } from '../components/chat/models/chat.interface';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    // Mock Initial Data
    private matches: Match[] = [
        { id: 1, name: 'Ana', photo: 'https://i.pravatar.cc/150?u=1', viewed: false },
        { id: 2, name: 'Beatriz', photo: 'https://i.pravatar.cc/150?u=2', viewed: false },
        { id: 3, name: 'Carla', photo: 'https://i.pravatar.cc/150?u=3', viewed: false },
        { id: 4, name: 'Dana', photo: 'https://i.pravatar.cc/150?u=4', viewed: false },
        { id: 5, name: 'Elisa', photo: 'https://i.pravatar.cc/150?u=5', viewed: false },
    ];

    private conversations: Conversation[] = [
        { id: 6, name: 'Fernanda', photo: 'https://i.pravatar.cc/150?u=6', lastMessage: 'Oi! Adorei suas fotos 😍', time: '10:30', unreadCount: 2, isOnline: true },
        { id: 7, name: 'Gabriela', photo: 'https://i.pravatar.cc/150?u=7', lastMessage: 'Vamos marcar algo?', time: 'Ontem', unreadCount: 0, isOnline: false },
        { id: 8, name: 'Helena', photo: 'https://i.pravatar.cc/150?u=8', lastMessage: 'Hahaha, verdade!', time: 'Ontem', unreadCount: 0, isOnline: false },
        { id: 9, name: 'Isabela', photo: 'https://i.pravatar.cc/150?u=9', lastMessage: 'Qual seu Instagram?', time: 'Seg', unreadCount: 0, isOnline: true },
        { id: 10, name: 'Julia', photo: 'https://i.pravatar.cc/150?u=10', lastMessage: 'Foi ótimo conversar com vc', time: 'Dom', unreadCount: 0, isOnline: false },
    ];

    // Observables
    private matchesSubject = new BehaviorSubject<Match[]>(this.matches);
    matches$ = this.matchesSubject.asObservable();

    private conversationsSubject = new BehaviorSubject<Conversation[]>(this.conversations);
    conversations$ = this.conversationsSubject.asObservable();

    constructor() { }

    addMatch(match: Match) {
        if (!this.matches.find(m => m.id === match.id)) {
            this.matches.unshift(match);
            this.matchesSubject.next([...this.matches]);
        }
    }

    // Unified remove method
    unmatch(id: number) {
        // Remove from matches
        this.matches = this.matches.filter(m => m.id !== id);
        this.matchesSubject.next([...this.matches]);

        // Remove from conversations
        this.conversations = this.conversations.filter(c => c.id !== id);
        this.conversationsSubject.next([...this.conversations]);
    }
}
