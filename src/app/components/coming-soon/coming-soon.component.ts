import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessService, LaunchStatus } from '../../core/services/access.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.scss']
})
export class ComingSoonComponent implements OnInit {
  status: LaunchStatus | null = null;

  constructor(private accessService: AccessService, private router: Router) { }

  ngOnInit(): void {
    // If we have cached status, use it. Otherwise fetch.
    this.status = this.accessService.getCachedStatus();

    if (!this.status) {
      this.accessService.checkLaunchStatus().subscribe(status => {
        this.status = status;
        if (status.canAccess) {
          this.router.navigate(['/feed']);
        }
      });
    } else if (this.status.canAccess) {
      this.router.navigate(['/feed']);
    }
  }
}
