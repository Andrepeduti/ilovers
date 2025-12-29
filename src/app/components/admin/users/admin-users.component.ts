import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser } from '../services/admin.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-users.component.html',
    styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
    private adminService = inject(AdminService);
    private authService = inject(AuthService);
    public router = inject(Router);

    currentUserId: string | null = null;

    users: AdminUser[] = [];
    loading = true;
    error: string | null = null;

    // Pagination & Search
    searchTerm = '';
    page = 1;
    pageSize = 10;
    totalCount = 0;

    get totalPages(): number {
        return Math.ceil(this.totalCount / this.pageSize);
    }

    ngOnInit() {
        this.currentUserId = this.authService.getUserId();
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.adminService.getUsers(this.page, this.pageSize, this.searchTerm).subscribe({
            next: (data) => {
                this.users = data.items;
                this.totalCount = data.totalCount;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load users', err);
                this.error = 'Erro ao carregar usuários.';
                this.loading = false;
            }
        });
    }

    onSearch() {
        this.page = 1;
        this.loadUsers();
    }

    nextPage() {
        if (this.page < this.totalPages) {
            this.page++;
            this.loadUsers();
        }
    }

    prevPage() {
        if (this.page > 1) {
            this.page--;
            this.loadUsers();
        }
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
