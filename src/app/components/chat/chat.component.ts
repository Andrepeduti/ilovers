import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService, ChatDto } from '../../services/chat.service';
import { MatchService, MatchProfile } from '../../services/match.service';
import { FeedService } from '../../core/services/feed.service';
import { AuthService } from '../../core/services/auth.service';
import { Conversation, Match } from './models/chat.interface';
import { LoaderComponent } from '../shared/loader/loader.component';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

    // Observables for template
    matches$: Observable<Match[]>;
    superLikes$: Observable<MatchProfile[]>;

    private router = inject(Router);
    private matchService = inject(MatchService);
    private chatService = inject(ChatService);
    private feedService = inject(FeedService);
    private authService = inject(AuthService);

    get isPremium(): boolean {
        const user = this.authService.currentUser();
        return user?.isPremium || false;
    }

    constructor() {
        this.matches$ = combineLatest([
            this.matchService.matches$,
            this.chatService.chats$
        ]).pipe(
            map(([matches, chats]) => {
                const activeChatUserIds = new Set((chats || [])
                    .filter(c => c.lastMessage && c.lastMessage.trim() !== '')
                    .map(c => c.otherUserId));

                // Only show matches who are NOT in the active chat list
                const filtered = matches.filter(m => !activeChatUserIds.has(m.id));
                return filtered.map(m => ({
                    id: m.id,
                    name: m.name,
                    photo: m.photo,
                    isNew: m.isNew,
                    chatId: m.chatId,
                    matchId: m.matchId,
                    isSuperLike: m.isSuperLike, // Map this field
                    superLikedBy: m.isSuperLike ? m.id : undefined
                } as Match));
            })
        );

        // Filter Super Likes: Hide if a conversation already exists for this user AND has messages
        this.superLikes$ = combineLatest([
            this.matchService.superLikes$,
            this.chatService.chats$
        ]).pipe(
            map(([superLikes, chats]) => {
                const activeChatUserIds = new Set((chats || [])
                    .filter(c => c.lastMessage && c.lastMessage.trim() !== '')
                    .map(c => c.otherUserId));

                return superLikes.filter(sl => !activeChatUserIds.has(sl.id));
            })
        );
    }

    ngOnInit() {
        this.loading = true;
        this.loadData();
    }

    loadData() {
        // Trigger fetches
        this.matchService.fetchMatches().subscribe();
        this.matchService.fetchSuperLikes().subscribe();

        // Load chats (Service handles cache return if available)
        this.chatService.loadChats().subscribe();

        // Subscribe to both streams for loading state
        // Subscribe to streams
        combineLatest([
            this.matchService.matches$,
            this.matchService.superLikes$,
            this.chatService.chats$
        ]).subscribe({
            next: ([matches, superLikes, chatDtos]) => {
                if (!chatDtos) {
                    this.loading = true;
                    return;
                }

                // 1. Process Conversations
                const activeDtos = chatDtos.filter(d => d.lastMessage !== null && d.lastMessage !== '');
                this.conversations = activeDtos.map(d => this.mapToConversation(d));

                // 2. Process Matches
                this.allMatches = matches.map(m => ({ ...m, superLikedBy: m.isSuperLike ? m.id : undefined } as Match));

                // 3. Filter
                this.conversationsLoaded = true;

                const activeChatIds = new Set(this.conversations.map(c => c.id.toString()));
                const superLikeIds = new Set(superLikes.map(sl => sl.id));

                this.matches = this.allMatches.filter(m => {
                    // Hide if in active chat
                    if (m.chatId && activeChatIds.has(m.chatId.toString())) {
                        return false;
                    }

                    // ROBUSTNESS: Hide if present in Super Likes list (Double check)
                    if (superLikeIds.has(m.id)) {
                        return false;
                    }
                    return true;
                });

                // 4. Stop Loading
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    private allMatches: Match[] = [];
    private conversationsLoaded = false;

    // Remove standalone filterMatches method as logic is now inside subscription
    // If needed elsewhere, can refactor back, but loadData handles reactive updates.

    mapToConversation(dto: ChatDto): Conversation {
        return {
            id: dto.chatId,
            name: dto.otherUserName,
            photo: dto.otherUserPhotoUrl || 'assets/placeholder.jpg',
            lastMessage: dto.lastMessage || 'Nova conexão',
            time: this.formatTime(dto.lastMessageTime),
            unreadCount: dto.unreadCount,
            isOnline: false,
            isSuperLike: dto.isSuperLike,
            superLikedBy: dto.superLikedBy,
            otherUserId: dto.otherUserId
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
        let otherUserId: string | undefined;

        // Type Guard logic
        if ('isNew' in item) {
            // It's a Match
            chatId = item.chatId; // Should exist now
            name = item.name;
            photo = item.photo;
            otherUserId = item.id; // Correct: Match id IS the user id

            // Mark as viewed: Remove red dot
            if (item.isNew) {
                this.matchService.markAsViewed(item.id);
            }

        } else {
            // It's a Conversation
            chatId = item.id.toString();
            name = item.name;
            photo = item.photo;
            otherUserId = (item as Conversation).otherUserId;
        }

        if (chatId) {
            const superLikedBy = item.superLikedBy;
            this.router.navigate(['chat', chatId], {
                state: { name, photo, otherUserId, superLikedBy }
            });
        } else {
            console.error('Chat ID missing for item', item);
        }
    }

    handleSuperLikeClick(sl: MatchProfile) {
        if (!this.isPremium) {
            alert('Funcionalidade exclusiva para usuários Pro. Assine para ver e conversar com quem te deu Super Like!');
            return;
        }

        // Auto-match (Like back) to create conversation
        this.feedService.like(sl.id).subscribe({
            next: (response) => {
                if (response.isMatch && response.chatId) {
                    // Navigate to the new chat
                    this.router.navigate(['chat', response.chatId], {
                        state: { name: sl.name, photo: sl.photo, superLikedBy: sl.id }
                    });
                } else {
                    // Fallback: Just view profile if for some reason it didn't match
                    this.router.navigate(['profile', sl.id]);
                }
            },
            error: (err) => {
                console.error('Error accepting super like', err);
                // Fallback on error
                this.router.navigate(['profile', sl.id]);
            }
        });
    }
}
