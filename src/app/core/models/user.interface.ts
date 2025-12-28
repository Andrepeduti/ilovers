export interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    bio?: string;
    photos: string[];
    location?: string;
}

export interface AuthResponse {
    data: {
        userId: string;
        accessToken: string;
        expiresIn: number;
    };
    meta: any;
}

export interface Profile extends User {
    preferences?: {
        minAge: number;
        maxAge: number;
        distance: number;
    };
    isPremium?: boolean;
    premiumExpiresAt?: Date;
}
