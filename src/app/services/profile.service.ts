import { Injectable } from '@angular/core';

export interface Profile {
    id: number;
    name: string;
    age: number | null;
    city: string;
    state: string;
    images: string[];
    bio: string;
    hobbies: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private profiles: Profile[] = [
        {
            id: 1,
            name: 'Sofia',
            age: null,
            city: 'São Paulo',
            state: 'SP',
            images: [
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=764&q=80',
                'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'
            ],
            bio: 'Apaixonada por fotografia e viagens.',
            hobbies: ['Fotografia', 'Viagens', 'Música']
        },
        {
            id: 2,
            name: 'Lucas',
            age: 27,
            city: 'Juiz de Fora',
            state: 'MG',
            images: [
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'
            ],
            bio: 'Curto aventuras ao ar livre e café.',
            hobbies: ['Trilhas', 'Café', 'Surf']
        },
        {
            id: 3,
            name: 'Ana',
            age: 22,
            city: 'Santa Catarina',
            state: 'SC',
            images: [
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=764&q=80',
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
                'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'
            ],
            bio: 'Estudante de arquitetura e amante de gatos.',
            hobbies: ['Arquitetura', 'Gatos', 'Design']
        },
        // Open Chats Mock Data
        {
            id: 6,
            name: 'Fernanda',
            age: 25,
            city: 'Rio de Janeiro',
            state: 'RJ',
            images: ['https://i.pravatar.cc/150?u=6', 'https://i.pravatar.cc/300?u=60', 'https://i.pravatar.cc/300?u=61'],
            bio: 'Adoro praia e suco natural, Adoro praia e suco natural, Adoro praia e suco natural, Adoro praia e suco natural asduhaushduas aushduahsd.',
            hobbies: ['Praia', 'Vôlei', 'Sucos']
        },
        {
            id: 7,
            name: 'Gabriela',
            age: 24,
            city: 'Salvador',
            state: 'BA',
            images: ['https://i.pravatar.cc/150?u=7', 'https://i.pravatar.cc/300?u=70'],
            bio: 'A vida é uma festa.',
            hobbies: ['Festas', 'Dança', 'Carnaval']
        },
        {
            id: 8,
            name: 'Helena',
            age: 28,
            city: 'Curitiba',
            state: 'PR',
            images: ['https://i.pravatar.cc/150?u=8', 'https://i.pravatar.cc/300?u=80', 'https://i.pravatar.cc/300?u=81'],
            bio: 'Café e livros, nada melhor.',
            hobbies: ['Leitura', 'Café', 'Inverno']
        },
        {
            id: 9,
            name: 'Isabela',
            age: 23,
            city: 'Porto Alegre',
            state: 'RS',
            images: ['https://i.pravatar.cc/150?u=9', 'https://i.pravatar.cc/300?u=90'],
            bio: 'Sempre em busca da próxima aventura.',
            hobbies: ['Viagem', 'Trilhas', 'Natureza']
        },
        {
            id: 10,
            name: 'Julia',
            age: 26,
            city: 'Belo Horizonte',
            state: 'MG',
            images: ['https://i.pravatar.cc/150?u=10', 'https://i.pravatar.cc/300?u=100'],
            bio: 'Pão de queijo is life.',
            hobbies: ['Gastronomia', 'Cinema', 'Pets']
        }
    ];

    constructor() { }

    getProfiles(): Profile[] {
        return this.profiles;
    }

    getProfile(id: number): Profile | undefined {
        return this.profiles.find(p => p.id === id);
    }
}
