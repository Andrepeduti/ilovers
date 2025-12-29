import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, Report } from '../services/admin.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-reports',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-reports.component.html',
    styleUrls: ['./admin-reports.component.scss']
})
export class AdminReportsComponent implements OnInit {
    private adminService = inject(AdminService);
    public router = inject(Router);

    reports: Report[] = [];
    loading = true;
    error: string | null = null;

    page = 1;
    pageSize = 10;
    totalCount = 0;

    get totalPages(): number {
        return Math.ceil(this.totalCount / this.pageSize);
    }

    ngOnInit() {
        this.loadReports();
    }

    loadReports() {
        this.loading = true;
        this.adminService.getReports(this.page, this.pageSize).subscribe({
            next: (data) => {
                this.reports = data.items;
                this.totalCount = data.totalCount;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load reports', err);
                this.error = 'Erro ao carregar denúncias.';
                this.loading = false;
            }
        });
    }

    nextPage() {
        if (this.page < this.totalPages) {
            this.page++;
            this.loadReports();
        }
    }

    prevPage() {
        if (this.page > 1) {
            this.page--;
            this.loadReports();
        }
    }
}
