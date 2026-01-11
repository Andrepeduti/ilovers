import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="forgot-container">
      <div class="card">
        <h2>Esqueci a Senha</h2>
        <p>Digite seu e-mail para receber um link de redefinição.</p>
        
        <form (ngSubmit)="onSubmit()" #forgotForm="ngForm">
          <div class="form-group">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" [(ngModel)]="email" required email>
          </div>

          <button type="submit" [disabled]="!forgotForm.form.valid || isLoading">
            {{ isLoading ? 'Enviando...' : 'Enviar Link' }}
          </button>
        </form>

        <div *ngIf="message" class="success-message">
          {{ message }}
        </div>
        
        <a routerLink="/login" class="back-link">Voltar para Login</a>
      </div>
    </div>
  `,
    styles: [`
    .forgot-container {
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
    p { margin-bottom: 1.5rem; color: #666; font-size: 0.9rem; }
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
    button:hover:not(:disabled) { background: #fa5252; }
    .success-message { margin-top: 1rem; color: #28a745; background: #d4edda; padding: 0.8rem; border-radius: 8px; }
    .back-link { display: block; margin-top: 1.5rem; color: #556270; text-decoration: none; font-size: 0.9rem; }
    .back-link:hover { text-decoration: underline; }
  `]
})
export class ForgotPasswordComponent {
    email: string = '';
    isLoading: boolean = false;
    message: string = '';

    constructor(private http: HttpClient) { }

    onSubmit() {
        if (!this.email) return;

        this.isLoading = true;
        // Assuming API URL structure, adjust if needed
        this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email: this.email })
            .subscribe({
                next: () => {
                    this.message = 'Se o e-mail existir, você receberá um link em breve.';
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.message = 'Erro ao processar solicitação. Tente novamente.';
                    this.isLoading = false;
                }
            });
    }
}
