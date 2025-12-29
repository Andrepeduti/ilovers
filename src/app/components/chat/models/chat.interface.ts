export interface Match {
    id: string;
    name: string;
    photo: string;
    isNew?: boolean;
    chatId?: string;
    viewed?: boolean;
    isSuperLike?: boolean;
    superLikedBy?: string;
}

export interface Conversation {
    id: string;
    name: string;
    photo: string;
    lastMessage: string;
    time: string;
    unreadCount: number;
    isOnline: boolean;
    isSuperLike?: boolean;
    superLikedBy?: string;
    otherUserId?: string;
}