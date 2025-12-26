import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService, ChatDto } from '../../services/chat.service';
import { MatchService } from '../../services/match.service';
import { Conversation, Match } from './models/chat.interface';
import { LoaderComponent } from '../shared/loader/loader.component';
import { forkJoin, combineLatest } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, LoaderComponent],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {

    matches: Match[] = [];
    conversations: Conversation[] = [];
    loading = true; // Global loading state

    private router = inject(Router);
    private matchService = inject(MatchService);
    private chatService = inject(ChatService);

    constructor() { }

    ngOnInit() {
        this.loading = true;
        // Optimization: Use combineLatest or forkJoin to handle parallel loading
        // But our services have different behaviors (one is Subject, one is HTTP)
        // Let's handle them individually but wait for "critical" data?
        // Or simpler: Just set loading false when chats arrive (since they are critical for filtering matches)
        this.loadData();
    }

    loadData() {
        // Trigger fetches
        this.matchService.fetchMatches().subscribe();

        // Load chats (Service handles cache return if available)
        this.chatService.loadChats().subscribe();

        // Subscribe to both streams
        combineLatest([
            this.matchService.matches$,
            this.chatService.chats$
        ]).subscribe({
            next: ([matches, chatDtos]) => {
                if (!chatDtos) {
                    this.loading = true;
                    return;
                }

                // 1. Process Conversations
                const activeDtos = chatDtos.filter(d => d.lastMessage !== null && d.lastMessage !== '');
                this.conversations = activeDtos.map(d => this.mapToConversation(d));

                // 2. Process Matches
                this.allMatches = matches;

                // 3. Filter
                this.conversationsLoaded = true; // Logic flag
                this.filterMatches();

                // 4. Stop Loading (Only if we have *something* or initialized)
                // Actually with combineLatest, this fires whenever EITHER emits usually after both emitted once.
                // We can safely say we are not loading anymore once we get here.
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    // loadMatches and loadConversations replaced by loadData with combineLatest for synchronized loading/filtering
    // But we keep map functions.


    private allMatches: Match[] = [];
    private conversationsLoaded = false;

    private filterMatches() {
        // Prevent flashing: Wait until conversations are loaded before showing matches
        if (!this.conversationsLoaded) {
            return;
        }

        if (!this.conversations.length) {
            this.matches = this.allMatches;
            return;
        }

        const activeChatIds = new Set(this.conversations.map(c => c.id.toString()));

        this.matches = this.allMatches.filter(m => {
            // If match is in active conversations, hide from matches list
            if (m.chatId && activeChatIds.has(m.chatId.toString())) {
                return false;
            }
            return true;
        });
    }

    mapToConversation(dto: ChatDto): Conversation {
        return {
            id: dto.chatId,
            name: dto.otherUserName,
            photo: dto.otherUserPhotoUrl || 'assets/placeholder.jpg',
            lastMessage: dto.lastMessage || 'Nova conexão',
            time: this.formatTime(dto.lastMessageTime),
            unreadCount: dto.unreadCount,
            isOnline: false
        };
    }

    formatTime(dateStr: string | null): string {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    openChat(item: Match | Conversation) {
        let chatId: string | undefined;
        let name: string;
        let photo: string;

        // Type Guard logic
        if ('isNew' in item) {
            // It's a Match
            chatId = item.chatId; // Should exist now
            name = item.name;
            photo = item.photo;

            // Mark as viewed: Remove red dot
            if (item.isNew) {
                this.matchService.markAsViewed(item.id);
            }

        } else {
            // It's a Conversation
            chatId = item.id.toString();
            name = item.name;
            photo = item.photo;
        }

        if (chatId) {
            this.router.navigate(['chat', chatId], {
                state: { name, photo }
            });
        } else {
            console.error('Chat ID missing for item', item);
        }
    }
}
