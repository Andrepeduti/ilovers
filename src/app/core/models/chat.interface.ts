import { User } from './user.interface';

export interface Message {
    id: string;
    senderId: number;
    receiverId: number;
    text: string;
    timestamp: Date;
    isRead: boolean;
}

export interface Conversation {
    id: string;
    user: User; // The other user in the conversation
    lastMessage?: Message;
    unreadCount: number;
}

export interface Match {
    id: string; // Match ID
    user: User;
    timestamp: Date;
}
