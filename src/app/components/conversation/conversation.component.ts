import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Message } from './models/conversation.interface';
import { ChatService } from '../../services/chat.service';

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
    showReportModal = false;
    reportReason = 'fake_profile';
    not_employee = ''
    reportComment = '';
    reportEvidence: string[] = [];

    constructor(
        private router: Router,
        private chatService: ChatService,
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
    }

    scrollToBottom(): void {
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

    openReportModal() {
        this.showMenu = false;
        this.showReportModal = true;
        // Reset form
        this.reportReason = '';
        this.reportComment = '';
        this.reportEvidence = [];
    }

    closeReportModal() {
        this.showReportModal = false;
    }

    onEvidenceSelected(event: any) {
        if (this.reportEvidence.length >= 3) return;

        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.reportEvidence.push(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    removeEvidence(index: number) {
        this.reportEvidence.splice(index, 1);
    }

    submitReport() {
        console.log('Report submitted:', {
            reason: this.reportReason,
            comment: this.reportComment,
            evidence: this.reportEvidence
        });
        alert('Denúncia enviada com sucesso! Analisaremos o caso.');
        this.closeReportModal();
    }
}
