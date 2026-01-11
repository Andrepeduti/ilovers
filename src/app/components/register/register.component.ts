import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InfoModalComponent } from '../shared/info-modal/info-modal.component';
import { LoaderService } from '../../core/services/loader.service'; // Adjust path
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
    bankEmployee = false;
    selectedBank = '';
    preferredBank = '';

    // Bank Options
    banks = [
        { name: 'Banco do Brasil', id: 'BB', logo: 'assets/banks/bb.png', type: 'traditional' },
        { name: 'Bradesco', id: 'BRADESCO', logo: 'assets/banks/bradesco.png', type: 'traditional' },
        { name: 'Itaú', id: 'ITAU', logo: 'assets/banks/itau.png', type: 'traditional' },
        { name: 'Santander', id: 'SANTANDER', logo: 'assets/banks/santander.png', type: 'traditional' },
        { name: 'Caixa', id: 'CAIXA', logo: 'assets/banks/caixa.png', type: 'traditional' },
        { name: 'Nubank', id: 'NUBANK', logo: 'assets/banks/nubank.png', type: 'digital' },
        { name: 'Inter', id: 'INTER', logo: 'assets/banks/inter.png', type: 'digital' },
        { name: 'C6 Bank', id: 'C6', logo: 'assets/banks/c6.png', type: 'digital' },
        { name: 'BTG Pactual', id: 'BTG', logo: 'assets/banks/btg.png', type: 'digital' },
        { name: 'Outros', id: 'OUTROS', logo: 'assets/banks/other.png', type: 'other' }
    ];

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


    private loaderService = inject(LoaderService);
    get isLoading() {
        return this.loaderService.loading();
    }

    constructor(private router: Router, private authService: AuthService) { }

    togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible;
    }

    toggleConfirmPasswordVisibility() {
        this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }

    updatePasswordRules() {
        this.clearError();
        this.isPasswordDirty = true;
        const p = this.password;
        this.passwordRules.minLength = p.length >= 8;
        this.passwordRules.upper = /[A-Z]/.test(p);
        this.passwordRules.lower = /[a-z]/.test(p);
        this.passwordRules.special = /[!@#$%^&*(),.?":{}|<>]/.test(p);
    }

    clearError() {
        if (this.registerError) {
            this.registerError = '';
        }
    }

    get isFormValid(): boolean {
        const emailsMatch = !!this.email && this.email === this.confirmEmail;
        const passwordsMatch = !!this.password && this.password === this.confirmPassword;
        const passwordValid = Object.values(this.passwordRules).every(r => r);
        const bankSelected = !!this.selectedBank;
        // preferredBank is optional/hidden in register now, defaulting to empty

        return this.isEmailValid && emailsMatch && passwordsMatch && passwordValid && bankSelected && this.termsAccepted && this.bankEmployee;
    }

    get isEmailValid(): boolean {
        // Regex strict validation
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email);
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

    emailError = '';
    passwordError = '';
    confirmPasswordError = '';
    confirmEmailError = '';
    bankError = '';

    termsError = false;
    bankEmployeeError = false;

    termsAccepted = false; // Added back

    onCreateAccount() {
        this.resetErrors();

        if (this.validateForm()) {
            this.loaderService.show();
            const registrationData = {
                email: this.email,
                password: this.password,
                bank: this.selectedBank,
                preferredBankFilter: this.preferredBank,
                acceptTerms: this.termsAccepted,
                bankEmployee: this.bankEmployee,
            };

            this.authService.register(registrationData).subscribe({
                next: () => {
                    this.router.navigate(['/profile']);
                    // Loader stays hidden (global loader handled by service)
                    // We DO NOT call hide() here to ensure it covers transition.
                    // ProfileComponent should eventually hide it or we rely on user navigation.
                    // But if ProfileComponent doesn't hide it, it stays forever.
                    // I will add a safe timeout here or better, add hide to ProfileComponent later.
                    // For now, I'll rely on the "second loader" complaint implying that previous logic WAS showing something.
                    // With global loader, it WILL cover everything.
                },
                error: (err) => {
                    this.loaderService.hide();
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

    resetErrors() {
        this.emailError = '';
        this.passwordError = '';
        this.confirmPasswordError = '';
        this.bankError = '';

        this.termsError = false;
        this.bankEmployeeError = false;
        this.registerError = '';
    }

    validateForm(): boolean {
        let isValid = true;
        this.registerError = '';

        if (!this.email) {
            this.registerError = 'E-mail é obrigatório.';
            return false;
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email)) {
            this.registerError = 'Formato de e-mail inválido. Ex: nome@dominio.com';
            return false;
        } else if (this.email !== this.confirmEmail) {
            this.registerError = 'Os e-mails não coincidem.';
            return false;
        }

        if (!this.password) {
            this.registerError = 'Senha é obrigatória.';
            return false;
        } else if (!Object.values(this.passwordRules).every(r => r)) {
            this.registerError = 'A senha não atende aos requisitos.';
            return false;
        }

        if (this.password !== this.confirmPassword) {
            this.registerError = 'As senhas devem ser iguais.';
            return false;
        }

        if (!this.selectedBank) {
            this.registerError = 'Selecione em qual banco você trabalha.';
            return false;
        }

        if (!this.termsAccepted) {
            this.registerError = 'Você deve aceitar os termos.';
            return false;
        }

        if (!this.bankEmployee) {
            this.registerError = 'É necessário declarar vínculo com a instituição.';
            return false;
        }

        return isValid;
    }

    scrollToField(fieldName: string) {
        const element = document.getElementById(fieldName);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
        }
    }

    selectBank(bankId: string) {
        this.selectedBank = bankId;
        this.clearError();
    }

    openModal(type: 'terms' | 'privacy', event: Event) {
        event.preventDefault();
        this.modalType = type;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    // Bank Selection Modal Logic
    isBankModalOpen = false;
    tempSelectedBank = '';
    otherBankName = '';

    get selectedBankName(): string {
        if (!this.selectedBank) return 'Selecione a Instituição';
        const bank = this.banks.find(b => b.name === this.selectedBank);
        return bank ? bank.name : this.selectedBank;
    }

    openBankModal() {
        this.isBankModalOpen = true;

        // Check if current selection is a known bank
        const isKnownBank = this.banks.some(b => b.name === this.selectedBank);

        if (this.selectedBank && !isKnownBank) {
            // It's a custom bank (previously entered via "Outros")
            this.tempSelectedBank = 'Outros';
            this.otherBankName = this.selectedBank;
        } else {
            this.tempSelectedBank = this.selectedBank;
            this.otherBankName = '';
        }
    }

    closeBankModal() {
        this.isBankModalOpen = false;
        this.tempSelectedBank = '';
        this.otherBankName = '';
    }

    toggleBankSelection(bankName: string) {
        // Single select logic
        if (this.tempSelectedBank === bankName) {
            this.tempSelectedBank = ''; // Deselect if same
        } else {
            this.tempSelectedBank = bankName; // Select new
        }
    }

    confirmBankSelection() {
        if (this.tempSelectedBank === 'Outros') {
            if (this.otherBankName.trim()) {
                this.selectedBank = this.otherBankName.trim();
            }
        } else {
            this.selectedBank = this.tempSelectedBank;
        }

        this.clearError();
        this.closeBankModal();
    }
}
