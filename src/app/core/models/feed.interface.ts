export interface FeedProfile {
    id: string;
    displayName: string;
    age: number;
    city: string;
    state: string;
    bio: string;
    mainPhotoUrl: string;
    photos: string[];
    hobbies: string[];
    bank?: string;
}

export interface FeedResponse {
    profiles: FeedProfile[];
}

export interface InteractionResponse {
    isMatch: boolean;
    chatId?: string;
}
