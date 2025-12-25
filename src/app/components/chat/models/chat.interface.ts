export interface Match {
    id: string | number;
    name: string;
    photo: string;
    viewed?: boolean;
}

export interface Conversation {
    id: string | number;
    name: string;
    photo: string;
    lastMessage: string;
    time: string;
    unreadCount: number;
    isOnline: boolean;
}