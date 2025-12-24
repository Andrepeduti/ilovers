import { User } from './user.interface';

export interface FeedProfile extends User {
    distance: number;
    matchPercentage?: number;
}
