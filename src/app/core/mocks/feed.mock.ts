import { FeedProfile } from '../models/feed.interface';

export const MOCK_FEED_PROFILES: FeedProfile[] = [
    {
        id: 101,
        name: 'Jessica',
        email: 'jessica@example.com',
        age: 24,
        bio: 'Loves hiking and photography.',
        photos: ['assets/mock/girl-1.jpg'],
        location: 'Rio de Janeiro',
        distance: 5,
        matchPercentage: 95
    },
    {
        id: 102,
        name: 'Amanda',
        email: 'amanda@example.com',
        age: 26,
        bio: 'Digital Nomad. Coffee addict.',
        photos: ['assets/mock/girl-2.jpg'],
        location: 'São Paulo',
        distance: 12,
        matchPercentage: 88
    },
    {
        id: 103,
        name: 'Carla',
        email: 'carla@example.com',
        age: 22,
        bio: 'Art student. Museum hopper.',
        photos: ['assets/mock/girl-3.jpg'],
        location: 'Curitiba',
        distance: 400,
        matchPercentage: 75
    }
];
