import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Match {
    id: number;
    name: string;
    photo: string;
}

interface Conversation {
    id: number;
    name: string;
    photo: string;
    lastMessage: string;
    time: string;
    unreadCount: number;
    isOnline: boolean;
}

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss'
})
export class ChatComponent {

    // Mock Data for "New Matches" (Horizontal Scroll)
    matches: Match[] = [
        { id: 1, name: 'Ana', photo: 'https://i.pravatar.cc/150?u=1' },
        { id: 2, name: 'Beatriz', photo: 'https://i.pravatar.cc/150?u=2' },
        { id: 3, name: 'Carla', photo: 'https://i.pravatar.cc/150?u=3' },
        { id: 4, name: 'Dana', photo: 'https://i.pravatar.cc/150?u=4' },
        { id: 5, name: 'Elisa', photo: 'https://i.pravatar.cc/150?u=5' },
    ];

    // Mock Data for "Conversations" (List)
    conversations: Conversation[] = [
        { id: 6, name: 'Fernanda', photo: 'https://i.pravatar.cc/150?u=6', lastMessage: 'Oi! Adorei suas fotos 😍', time: '10:30', unreadCount: 2, isOnline: true },
        { id: 7, name: 'Gabriela', photo: 'https://i.pravatar.cc/150?u=7', lastMessage: 'Vamos marcar algo?', time: 'Ontem', unreadCount: 0, isOnline: false },
        { id: 8, name: 'Helena', photo: 'https://i.pravatar.cc/150?u=8', lastMessage: 'Hahaha, verdade!', time: 'Ontem', unreadCount: 0, isOnline: false },
        { id: 9, name: 'Isabela', photo: 'https://i.pravatar.cc/150?u=9', lastMessage: 'Qual seu Instagram?', time: 'Seg', unreadCount: 0, isOnline: true },
        { id: 10, name: 'Julia', photo: 'https://i.pravatar.cc/150?u=10', lastMessage: 'Foi ótimo conversar com vc', time: 'Dom', unreadCount: 0, isOnline: false },
    ];

    openChat(id: number) {
        console.log('Open chat with', id);
        // Future: proper navigation to individual chat room
    }

}
