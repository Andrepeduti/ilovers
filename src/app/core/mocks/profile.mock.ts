import { Profile } from '../models/user.interface';

export const MOCK_MY_PROFILE: Profile = {
    id: 1,
    name: 'André Tester',
    email: 'andre@ilovers.com',
    age: 28,
    bio: 'Software Engineer & Lover of Coffee',
    photos: ['assets/mock/user-main.jpg', 'assets/mock/user-2.jpg'],
    location: 'São Paulo, SP',
    preferences: {
        minAge: 18,
        maxAge: 35,
        distance: 50
    }
};
