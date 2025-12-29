import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminUser } from '../services/admin.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-users.component.html',
    styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
    private adminService = inject(AdminService);
    public router = inject(Router);

    users: AdminUser[] = [];
    loading = true;
    error: string | null = null;

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.adminService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load users', err);
                this.error = 'Erro ao carregar usuários.';
                this.loading = false;
            }
        });
    }

    deleteUser(user: AdminUser) {
        if (!confirm(`Tem certeza que deseja apagar o usuário ${user.email}? Essa ação não pode ser desfeita e apagará TUDO (Matches, Fotos, Conversas).`)) {
            return;
        }

        this.adminService.deleteUser(user.id).subscribe({
            next: () => {
                this.users = this.users.filter(u => u.id !== user.id);
                alert('Usuário removido com sucesso!');
            },
            error: (err) => {
                console.error('Failed to delete user', err);
                alert('Erro ao apagar usuário.');
            }
        });
    }
}
