import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InfoModalComponent } from '../shared/info-modal/info-modal.component';
import { AuthService } from '../../core/services/auth.service';


@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, InfoModalComponent],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    email = '';
    confirmEmail = '';
    password = '';
    confirmPassword = '';
    bankId = '';
    termsAccepted = false;
    bankEmployee = false;
    bankIdInvalid = false;
    passwordVisible = false;
    confirmPasswordVisible = false;

    showModal = false;
    modalType: 'terms' | 'privacy' = 'terms';

    passwordRules = {
        minLength: false,
        upper: false,
        lower: false,
        special: false
    };

    isPasswordDirty = false;
    registerError = '';
    isLoading = false;

    constructor(private router: Router, private authService: AuthService) { }

    togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible;
    }

    toggleConfirmPasswordVisibility() {
        this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }

    updatePasswordRules() {
        this.isPasswordDirty = true;
        const p = this.password;
        this.passwordRules.minLength = p.length >= 8;
        this.passwordRules.upper = /[A-Z]/.test(p);
        this.passwordRules.lower = /[a-z]/.test(p);
        this.passwordRules.special = /[!@#$%^&*(),.?":{}|<>]/.test(p);
    }

    get isFormValid(): boolean {
        const emailsMatch = !!this.email && this.email === this.confirmEmail;
        const passwordsMatch = !!this.password && this.password === this.confirmPassword;
        const passwordValid = Object.values(this.passwordRules).every(r => r);
        const bankIdFilled = !!this.bankId;

        return emailsMatch && passwordsMatch && passwordValid && bankIdFilled && this.termsAccepted && this.bankEmployee;
    }

    get passwordsMatch(): boolean {
        return !!this.password && this.password === this.confirmPassword;
    }

    get emailsMatch(): boolean {
        return !!this.email && this.email === this.confirmEmail;
    }

    get showEmailMismatchError(): boolean {
        return !!this.confirmEmail && this.email !== this.confirmEmail;
    }

    onCreateAccount() {
        this.registerError = '';
        if (this.isFormValid) {
            this.isLoading = true;
            const registrationData = {
                email: this.email,
                password: this.password,
                employeeId: this.bankId,
                acceptTerms: this.termsAccepted,
                bankEmployee: this.bankEmployee,
            };

            this.authService.register(registrationData).subscribe({
                next: () => {
                    // isLoading stays true while navigating
                    this.router.navigate(['/profile']);
                },
                error: (err) => {
                    this.isLoading = false;
                    console.error('Registration failed', err);
                    const code = err.error?.error?.code;

                    if (code === 'EMAIL_ALREADY_EXISTS') {
                        this.registerError = 'Este e-mail já está em uso.';
                    } else if (code === 'EMPLOYEE_ID_ALREADY_EXISTS') {
                        this.registerError = 'ID do funcionário já está em uso.';
                    } else {
                        this.registerError = 'Falha no cadastro. Verifique os dados e tente novamente.';
                    }
                }
            });
        }
    }

    onBankIdInput(event: Event) {
        const input = event.target as HTMLInputElement;

        let value = input.value.replace(/\D/g, '');

        value = value.slice(0, 9);

        input.value = value;
        this.bankId = value;

        this.bankIdInvalid = value.length !== 9;
    }

    openModal(type: 'terms' | 'privacy', event: Event) {
        event.preventDefault();
        this.modalType = type;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }
}
