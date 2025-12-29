import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, DashboardMetrics } from '../services/admin.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
    private adminService = inject(AdminService);
    private router = inject(Router);

    metrics: DashboardMetrics | null = null;
    loading = true;
    error: string | null = null;

    ngOnInit() {
        this.loadMetrics();
    }

    loadMetrics() {
        this.loading = true;
        this.adminService.getDashboardMetrics().subscribe({
            next: (data) => {
                this.metrics = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load metrics', err);
                this.error = 'Falha ao carregar dados. Verifique suas permissões.';
                this.loading = false;
            }
        });
    }

    goBack() {
        this.router.navigate(['/feed']);
    }

    goToUsers() {
        this.router.navigate(['/admin/users']);
    }

    goToReports() {
        this.router.navigate(['/admin/reports']);
    }
}
