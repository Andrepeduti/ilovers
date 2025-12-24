import { Conversation, Match } from '../models/chat.interface';

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'c1',
        user: {
            id: 201,
            name: 'Bruna',
            email: 'bruna@example.com',
            age: 23,
            photos: ['assets/mock/girl-4.jpg'],
            location: 'São Paulo'
        },
        unreadCount: 2,
        lastMessage: {
            id: 'm1',
            senderId: 201,
            receiverId: 1,
            text: 'Oi! Adorei suas fotos :)',
            timestamp: new Date(),
            isRead: false
        }
    },
    {
        id: 'c2',
        user: {
            id: 202,
            name: 'Mariana',
            email: 'mariana@example.com',
            age: 25,
            photos: ['assets/mock/girl-5.jpg'],
            location: 'Campinas'
        },
        unreadCount: 0,
        lastMessage: {
            id: 'm2',
            senderId: 1,
            receiverId: 202,
            text: 'Vamos marcar algo?',
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            isRead: true
        }
    }
];

export const MOCK_MATCHES: Match[] = [
    {
        id: 'mat1',
        user: {
            id: 301,
            name: 'Fernanda',
            email: 'fernanda@example.com',
            age: 21,
            photos: ['assets/mock/girl-6.jpg'],
            location: 'Santos'
        },
        timestamp: new Date()
    },
    {
        id: 'mat2',
        user: {
            id: 302,
            name: 'Gabriela',
            email: 'gabi@example.com',
            age: 27,
            photos: ['assets/mock/girl-7.jpg'],
            location: 'São Paulo'
        },
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
    }
];
