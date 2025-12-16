import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Message } from './models/conversation.interface';
import { ChatService } from '../../services/chat.service';
import { ProfileService } from '../../services/profile.service';

@Component({
    selector: 'app-conversation',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './conversation.component.html',
    styleUrl: './conversation.component.scss'
})
export class ConversationComponent implements OnInit {
    messages: Message[] = [
        { id: 1, text: 'Oi! Tudo bem?', isMe: false, time: '10:30' },
        { id: 2, text: 'Olá! Tudo ótimo e você?', isMe: true, time: '10:31' },
        { id: 3, text: 'Tudo tranquilo por aqui também.', isMe: true, time: '10:32' }
    ];

    newMessage: string = '';

    chatPartner: { name: string; photo: string } | null = null;
    partnerId: number | null = null;

    showMenu = false;
    showUnmatchModal = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private chatService: ChatService,
        private profileService: ProfileService
    ) {
        // Try to get data from State (Navigation) first
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
            this.chatPartner = {
                name: navigation.extras.state['name'],
                photo: navigation.extras.state['photo']
            };
        }
    }

    ngOnInit() {
        this.scrollToBottom();

        // Subscribe to params to get ID
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.partnerId = +id;

                // PERSISTENCE FIX: 
                // If chatPartner is null (e.g., refresh or back from profile), fetch from Service
                if (!this.chatPartner) {
                    const profile = this.profileService.getProfile(this.partnerId);
                    if (profile) {
                        this.chatPartner = {
                            name: profile.name,
                            photo: profile.images[0]
                        };
                    } else {
                        // Optional: Try finding in ChatService if not in ProfileService (though ProfileService has the superset)
                        // Fallback
                        this.chatPartner = {
                            name: 'Usuário',
                            photo: 'https://i.pravatar.cc/150?u=99'
                        };
                    }
                }
            }
        });
    }

    scrollToBottom(): void {
        // Implementation for scrolling to bottom
    }

    sendMessage() {
        if (this.newMessage.trim()) {
            this.messages.push({
                id: this.messages.length + 1,
                text: this.newMessage,
                isMe: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            this.newMessage = '';
            setTimeout(() => this.scrollToBottom(), 100);
        }
    }

    toggleMenu() {
        this.showMenu = !this.showMenu;
    }

    viewProfile() {
        this.showMenu = false;
        if (this.partnerId) {
            this.router.navigate(['/profile', this.partnerId]);
        } else {
            console.warn('No partner ID found');
        }
    }

    // Unmatch Logic
    openUnmatchModal() {
        this.showMenu = false;
        this.showUnmatchModal = true;
    }

    closeUnmatchModal() {
        this.showUnmatchModal = false;
    }

    confirmUnmatch() {
        if (this.partnerId) {
            this.chatService.unmatch(this.partnerId);
            this.closeUnmatchModal();
            this.router.navigate(['/chat']);
        }
    }

    goBack() {
        this.router.navigate(['/chat']);
    }
}
