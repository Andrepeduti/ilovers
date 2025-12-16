import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { MatchService } from '../../services/match.service';
import { Conversation, Match } from './models/chat.interface';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss'
})
export class ChatComponent {

    // Data from Service
    matches: Match[] = [];
    conversations: Conversation[] = [];

    constructor(
        private router: Router,
        private matchService: MatchService, // Keep for "New Match" event logic if needed, or migrate fully.
        private chatService: ChatService
    ) {
        // Subscribe to global state
        this.chatService.matches$.subscribe(m => this.matches = m);
        this.chatService.conversations$.subscribe(c => this.conversations = c);

        // Listen to new matches from Feed (MatchService) and add to global ChatService
        this.matchService.matches$.subscribe(newMatches => {
            newMatches.forEach(nm => {
                this.chatService.addMatch({
                    id: nm.id,
                    name: nm.name,
                    photo: nm.photo,
                    viewed: nm.viewed || false
                });
            });
        });
    }

    openChat(id: number) {
        const conversation = this.conversations.find(c => c.id === id);
        const match = this.matches.find(m => m.id === id);

        if (match) {
            match.viewed = true;
        }

        const target = conversation || match;

        if (target) {
            this.router.navigate(['chat', id], {
                state: {
                    name: target.name,
                    photo: target.photo
                }
            });
        }
    }
}
