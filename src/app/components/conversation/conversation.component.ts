import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatService, MessageDto } from '../../services/chat.service';
import { ChatRealtimeService, ChatMessageDto } from '../../services/chat-realtime.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

interface UIMessage {
    id: string | number;
    text: string;
    isMe: boolean;
    time: string;
    status: 'sending' | 'sent' | 'read';
    rawDate: string; // ISO string for pagination
}

@Component({
    selector: 'app-conversation',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './conversation.component.html',
    styleUrl: './conversation.component.scss'
})
export class ConversationComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    messages: UIMessage[] = [];
    newMessage: string = '';
    loading = true;
    loadingHistory = false; // Flag for top scroll loading

    chatId: string | null = null;
    myUserId: string | null = null;

    chatPartner: { name: string; photo: string } | null = null;

    // Subscriptions
    private routeSub!: Subscription;
    private messageSub!: Subscription;

    showMenu = false;
    showUnmatchModal = false;
    showReportModal = false;

    // Injected Services
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private chatService = inject(ChatService);
    private chatRealtimeService = inject(ChatRealtimeService);
    private authService = inject(AuthService);

    reportReason = '';
    reportComment = '';
    reportEvidence: any[] = [];

    constructor() {
        // Try to get data from State (Navigation) first
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
            this.chatPartner = {
                name: navigation.extras.state['name'],
                photo: navigation.extras.state['photo']
            };
        }
    }

    private ackSub!: Subscription;

    ngOnInit() {
        this.myUserId = this.authService.getUserId();

        this.routeSub = this.route.paramMap.subscribe(params => {
            this.chatId = params.get('id');
            if (this.chatId) {
                this.loadHistory(this.chatId);
                this.connectSignalR(this.chatId);
            }
        });

        // Listen for Realtime messages
        this.messageSub = this.chatRealtimeService.messageReceived$.subscribe(msg => {
            if (msg.chatId === this.chatId) {
                this.pushMessage(msg);
                this.scrollToBottom();
            }
        });

        // Listen for Acks
        this.ackSub = this.chatRealtimeService.messageAck$.subscribe(ack => {
            const index = this.messages.findIndex(m => m.id === ack.tempId);
            if (index !== -1) {
                // Check if real ID already exists (Race Condition: ReceiveMessage arrived first)
                if (this.messages.some(m => m.id === ack.realId)) {
                    // Duplicate found, remove the temporary one
                    this.messages.splice(index, 1);
                } else {
                    // Update temp ID to real ID
                    this.messages[index].id = ack.realId;
                    this.messages[index].status = 'sent';
                    this.messages[index].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Refresh time
                }
            }
        });
    }

    ngAfterViewChecked() {
        // Auto scroll on init if needed, though typically explicit calls are better
    }

    ngOnDestroy() {
        if (this.chatId) {
            this.chatRealtimeService.leaveChat(this.chatId);
        }
        if (this.routeSub) this.routeSub.unsubscribe();
        if (this.messageSub) this.messageSub.unsubscribe();
        if (this.ackSub) this.ackSub.unsubscribe();
    }

    async connectSignalR(chatId: string) {
        await this.chatRealtimeService.startConnection();
        await this.chatRealtimeService.joinChat(chatId);
    }

    loadHistory(chatId: string, before?: string) {
        if (!before) this.loading = true;
        else this.loadingHistory = true;

        this.chatService.getMessages(chatId, 30, before)
            .pipe(finalize(() => {
                this.loading = false;
                this.loadingHistory = false;
            }))
            .subscribe({
                next: (msgs) => {
                    const chronological = [...msgs].reverse();
                    const uiMsgs = chronological.map(m => this.mapToUI(m));

                    if (before) {
                        // Prepend logic
                        const container = this.scrollContainer.nativeElement;
                        const oldHeight = container.scrollHeight;
                        this.messages = [...uiMsgs, ...this.messages];

                        // Restore scroll position
                        setTimeout(() => {
                            const newHeight = container.scrollHeight;
                            container.scrollTop = newHeight - oldHeight;
                        });
                    } else {
                        this.messages = uiMsgs;
                        this.scrollToBottom();
                        // Mark as read only on initial load or if at bottom?
                        this.chatService.markAsRead(chatId).subscribe();
                    }
                },
                error: (err) => console.error('Error loading history', err)
            });
    }

    onScroll() {
        const container = this.scrollContainer.nativeElement;
        if (container.scrollTop === 0 && !this.loading && !this.loadingHistory && this.messages.length > 0) {
            const oldest = this.messages[0];
            if (oldest && oldest.rawDate) {
                this.loadHistory(this.chatId!, oldest.rawDate);
            }
        }
    }

    mapToUI(msg: MessageDto | ChatMessageDto): UIMessage {
        // Parse dates safely
        const date = new Date(msg.createdAt);
        const timeStr = isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const myId = this.myUserId ? this.myUserId.toLowerCase() : '';
        const senderId = msg.senderUserId ? msg.senderUserId.toLowerCase() : '';
        const isMe = senderId === myId;

        return {
            id: msg.id,
            text: msg.content,
            isMe: isMe,
            time: timeStr,
            status: isMe ? (msg.isRead ? 'read' : 'sent') : 'read',
            rawDate: msg.createdAt
        };
    }

    pushMessage(msg: MessageDto | ChatMessageDto) {
        // 1. Exact duplicate check
        if (this.messages.some(m => m.id === msg.id)) return;

        // 2. Optimistic Deduplication
        // If the incoming message is from "Me", it might be the confirmation of our optimistic push.
        // We look for a temp message with the same content.
        const myId = this.myUserId ? this.myUserId.toLowerCase() : '';
        const senderId = msg.senderUserId ? msg.senderUserId.toLowerCase() : '';

        if (senderId === myId) {
            const optimistic = this.messages.find(m =>
                m.isMe &&
                typeof m.id === 'string' &&
                m.id.toString().startsWith('temp-') &&
                m.text === msg.content
            );

            if (optimistic) {
                // Determine if we should replace or remove
                // Ideally, replace the ID so it becomes "real"
                optimistic.id = msg.id;
                optimistic.status = 'sent';

                const date = new Date(msg.createdAt);
                optimistic.time = isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                optimistic.rawDate = msg.createdAt;

                return;
            }
        }

        this.messages.push(this.mapToUI(msg));
        this.scrollToBottom();
    }

    async sendMessage() {
        if (!this.newMessage.trim() || !this.chatId || !this.myUserId) return;

        const content = this.newMessage;
        this.newMessage = ''; // Clear immediately

        // Optimistic UI
        const tempId = 'temp-' + Date.now(); // This ID needs to be sent to server? No, server sends back Empty tempId currently?
        // WAIT. Backend: await Clients.Caller.SendAsync("MessageSentAck", new { TempId = "", RealId = message.Id });
        // Backend sends TempId = "". It doesn't know my TempId!
        // Constraint: I cannot send TempId to backend without changing API.
        // Problem: If I have multiple pending messages, Ack comes with RealID only.
        // How do I map RealID to specific TempID if logic relies on TempId?
        // User request: "Emit MessageSentAck to sender... Front must mark as sent".
        // If backends sends only RealID, I can only match by Content? Or I assume FIFO?
        // FIFO is risky if network reorders.
        // Content match is heuristic.
        // Ideally backend echoes my ClientID.
        // Current Backend Implementation: `new { TempId = "", RealId = message.Id }`
        // I should probably pass TempId to `sendMessage` on backend? 
        // Or if I can't change backend API signature easily (User Rule: "Rejeitar SendMessage para chats não pertencentes").
        // Actually, I just modified Backend `SendMessage`. I CAN modify it to accept `tempId`.
        // Let's modify Backend first if strictly needed.
        // BUT, for now, let's assume I need to match by Content if TempId is missing?
        // No, that's flaky.
        // Let's modify Backend `SendMessage` to accept `tempId` string?
        // "Adicionar validações explícitas no ChatHub". "Ajustar GET".
        // I can change `SendMessage(chatId, content)` to `SendMessage(chatId, content, tempId)`.

        // Let's update frontend to send it.

        const optimisticMsg: UIMessage = {
            id: tempId,
            text: content,
            isMe: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sending',
            rawDate: new Date().toISOString()
        };

        this.messages.push(optimisticMsg);
        this.scrollToBottom();

        try {
            await this.chatRealtimeService.sendMessage(this.chatId, content, tempId);
        } catch (err) {
            console.error('Send error', err);
            // Mark as error
        }
    }

    scrollToBottom(): void {
        setTimeout(() => {
            if (this.scrollContainer) {
                this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            } else {
                // Fallback selector
                const el = document.querySelector('.messages-list');
                if (el) el.scrollTop = el.scrollHeight;
            }
        }, 100);
    }

    // ... Navigation & Modals preserved
    goBack() {
        this.router.navigate(['/chat']);
    }

    toggleMenu() { this.showMenu = !this.showMenu; }
    viewProfile() {
        // Implement navigation if partnerId available
    }

    openReportModal() { this.showReportModal = true; }
    closeReportModal() { this.showReportModal = false; }
    openUnmatchModal() { this.showUnmatchModal = true; }
    closeUnmatchModal() { this.showUnmatchModal = false; }
    confirmUnmatch() { /* Call service unmatch */ }
    submitReport() { /* Report logic */ this.closeReportModal(); }
    onEvidenceSelected(e: any) { }
    removeEvidence(i: number) { }
}
