export interface Match {
    id: number;
    name: string;
    photo: string;
    viewed?: boolean;
}

export interface Conversation {
    id: number;
    name: string;
    photo: string;
    lastMessage: string;
    time: string;
    unreadCount: number;
    isOnline: boolean;
}