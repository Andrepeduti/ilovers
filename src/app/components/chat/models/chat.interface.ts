export interface Match {
    id: string;
    name: string;
    photo: string;
    isNew?: boolean;
    chatId?: string;
    viewed?: boolean;
}

export interface Conversation {
    id: string;
    name: string;
    photo: string;
    lastMessage: string;
    time: string;
    unreadCount: number;
    isOnline: boolean;
}