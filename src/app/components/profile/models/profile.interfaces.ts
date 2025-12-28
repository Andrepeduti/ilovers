export interface IProfile {
    displayName: string;
    bio: string;
    age: number | null;
    hideAge: boolean;
    state: string;
    city: string;
    gender: string;
    interestedIn: string;
    ageRange: {
        min: number | null;
        max: number | null;
    };
    seeAllAges: boolean;
    hobbies: string[];
    photos: (string | null)[];
    isComplete?: boolean;
    isPremium?: boolean;
    premiumExpiresAt?: Date;
}