import { Injectable, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, BehaviorSubject, tap } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { ChatRealtimeService } from './chat-realtime.service';

export interface ChatDto {
    chatId: string;
    otherUserId: string;
    otherUserName: string;
    otherUserPhotoUrl: string | null;
    lastMessage: string | null;
    lastMessageTime: string | null;
    unreadCount: number;
    isSuperLike: boolean;
}

export interface MessageDto {
    id: string;
    chatId: string;
    senderUserId: string;
    content: string;
    createdAt: string;
    isRead: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private http = inject(HttpClient);
    private chatRealtimeService = inject(ChatRealtimeService);
    private authService = inject(AuthService); // Inject AuthService
    private apiUrl = `${environment.apiUrl}/chats`;

    private chatsSubject = new BehaviorSubject<ChatDto[] | null>(null);
    chats$ = this.chatsSubject.asObservable();

    totalUnread$ = this.chats$.pipe(
        map(chats => chats ? chats.filter(c => c.unreadCount > 0).length : 0)
    );

    constructor() {
        // Automatically clear cache when user logs out or changes
        effect(() => {
            const user = this.authService.currentUser();
            if (!user) {
                this.clearCache();
            }
        });

        // Listen for new messages to update the list cache
        this.chatRealtimeService.messageReceived$.subscribe(msg => {
            // ... (existing logic)
            const currentChats = this.chatsSubject.value;
            if (!currentChats) return;

            const chatIndex = currentChats.findIndex(c => c.chatId === msg.chatId);
            if (chatIndex > -1) {
                const chat = currentChats[chatIndex];
                const myId = this.authService.getUserId();
                const isMyMessage = msg.senderUserId === myId;

                const updatedChat = {
                    ...chat,
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt,
                    unreadCount: isMyMessage ? chat.unreadCount : chat.unreadCount + 1
                };

                const otherChats = currentChats.filter(c => c.chatId !== msg.chatId);
                this.chatsSubject.next([updatedChat, ...otherChats]);
            } else {
                // New chat started? Refresh list to get full ChatDto details (name, photo, etc.)
                this.refreshChats();
            }
        });
    }

    // Cache accessor
    get currentChatsValue(): ChatDto[] | null {
        return this.chatsSubject.value;
    }

    loadChats(force: boolean = false): Observable<ChatDto[]> {
        // If we have cache and not forcing, return immediately
        if (!force && this.chatsSubject.value) {
            return new BehaviorSubject(this.chatsSubject.value).asObservable();
        }

        return this.http.get<any>(this.apiUrl).pipe(
            map(response => response.value || response.data || response),
            tap(chats => {
                this.chatsSubject.next(chats);
            })
        );
    }

    refreshChats() {
        this.loadChats(true).subscribe();
    }

    // Clear cache on logout
    clearCache() {
        this.chatsSubject.next(null);
    }

    getMessages(chatId: string, limit: number = 30, before?: string): Observable<MessageDto[]> {
        let url = `${this.apiUrl}/${chatId}/messages?limit=${limit}`;
        if (before) {
            url += `&before=${before}`;
        }
        return this.http.get<any>(url).pipe(
            map(response => {
                return response.value || response.data || response;
            })
        );
    }

    markAsRead(chatId: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${chatId}/read`, {}).pipe(
            tap(() => {
                // Optimistically update unread count in cache
                const current = this.chatsSubject.value;
                if (current) {
                    const updated = current.map(c => {
                        if (c.chatId === chatId) return { ...c, unreadCount: 0 };
                        return c;
                    });
                    this.chatsSubject.next(updated);
                }
            })
        );
    }

    removeChat(chatId: string) {
        const current = this.chatsSubject.value;
        if (current) {
            const updated = current.filter(c => c.chatId !== chatId);
            this.chatsSubject.next(updated);
        }
    }
}
