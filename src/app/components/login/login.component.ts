import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    public frm: FormGroup;
    public pseudo: FormControl;
    public password: FormControl;
    public message = '';

    constructor(
        public authService: AuthService, // pour pouvoir faire le login
        public router: Router,           // pour rediriger vers la page d'accueil en cas de login
        private fb: FormBuilder          // pour construire le formulaire, du côté TypeScript
    ) {
        this.setMessage();

        this.pseudo = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.password = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.frm = this.fb.group({
            pseudo: this.pseudo,
            password: this.password
        });
    }

    setMessage() {
        this.message = 'You are logged ' + (this.authService.isLoggedIn ? 'in' : 'out') + '.';
    }

    /**
     * Cette méthode est bindée sur le click du bouton de login du template. On va y faire le
     * login en faisant appel à notre AuthService.
     */
    login() {
        this.message = 'Trying to log in ...';
        this.authService.login(this.frm.value.pseudo, this.frm.value.password).subscribe(() => {
            this.setMessage();
            if (this.authService.isLoggedIn) {
                // Get the redirect URL from our auth service
                // If no redirect has been set, use the default
                const redirect = this.authService.redirectUrl || '/home';
                this.authService.redirectUrl = null;
                // Redirect the user
                this.router.navigate([redirect]);
            } else {
                this.message = 'Login failed!';
            }
        });
    }

    logout() {
        this.authService.logout();
        this.setMessage();
        this.frm.reset();   // réinitialise le formulaire avec les valeurs par défaut
    }
}
