export interface IProfile {
    name: string;
    description: string;
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
    interests: string[];
}