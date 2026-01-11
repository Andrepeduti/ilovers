import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="reset-container">
      <div class="card">
        <h2>Redefinir Senha</h2>
        
        <div *ngIf="!isValidToken" class="error-state">
          <p>Link inválido ou expirado.</p>
          <a routerLink="/auth/forgot-password">Solicitar novo link</a>
        </div>

        <form *ngIf="isValidToken" (ngSubmit)="onSubmit()" #resetForm="ngForm">
          <div class="form-group">
            <label for="password">Nova Senha</label>
            <input type="password" id="password" name="password" [(ngModel)]="password" required minlength="6">
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirmar Senha</label>
            <input type="password" id="confirmPassword" name="confirmPassword" [(ngModel)]="confirmPassword" required>
            <div *ngIf="password !== confirmPassword && confirmPassword" class="field-error">
              As senhas não coincidem.
            </div>
          </div>

          <button type="submit" [disabled]="!resetForm.form.valid || password !== confirmPassword || isLoading">
            {{ isLoading ? 'Redefinindo...' : 'Salvar Nova Senha' }}
          </button>
        </form>

        <div *ngIf="message" [class.success-message]="isSuccess" [class.error-message]="!isSuccess">
          {{ message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reset-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #FF6B6B, #556270);
      font-family: 'Outfit', sans-serif;
    }
    .card {
      background: rgba(255, 255, 255, 0.95);
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    h2 { margin-bottom: 1rem; color: #333; }
    .form-group { margin-bottom: 1.5rem; text-align: left; }
    label { display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500; }
    input {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }
    button {
      width: 100%;
      padding: 0.8rem;
      background: #FF6B6B;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }
    button:disabled { background: #ffb3b3; cursor: not-allowed; }
    .success-message { margin-top: 1rem; color: #28a745; background: #d4edda; padding: 0.8rem; border-radius: 8px; }
    .error-message { margin-top: 1rem; color: #721c24; background: #f8d7da; padding: 0.8rem; border-radius: 8px; }
    .field-error { color: #dc3545; font-size: 0.8rem; margin-top: 0.2rem; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  isValidToken: boolean = true;
  isLoading: boolean = false;
  message: string = '';
  isSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.email = params['email'];

      if (!this.token || !this.email) {
        this.isValidToken = false;
      }
    });
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) return;

    this.isLoading = true;
    this.authService.resetPassword({
      token: this.token,
      email: this.email,
      newPassword: this.password
    }).subscribe({
      next: () => {
        this.isSuccess = true;
        this.message = 'Senha redefinida com sucesso! Redirecionando...';
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        console.error(err);
        this.isSuccess = false;
        this.message = 'Erro ao redefinir senha. O link pode ter expirado.';
        this.isLoading = false;
      }
    });
  }
}
