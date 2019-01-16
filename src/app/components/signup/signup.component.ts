import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { Member, MemberService } from '../../services/member.service';
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import * as _ from 'lodash';
import { MemberCommonService } from '../../services/member-common.service';
import { SignupService } from '../../services/signup.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-signup-mat',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
    public frm: FormGroup;
    public frmPhone: FormGroup;
    public ctlPseudo: FormControl;
    public ctlProfile: FormControl;
    public ctlPassword: FormControl;
    public ctlBirthDate: FormControl;
    public ctlPhoneType: FormControl;
    public ctlPhoneNumber: FormControl;

    public phones;

    constructor(
        private fb: FormBuilder,
        private signupService: SignupService,
        public authService: AuthService, // pour pouvoir faire le login
        public router: Router) {
        this.ctlPseudo = this.fb.control('', [Validators.required, Validators.minLength(3),
        this.forbiddenValue('abc')], [this.pseudoUsed()]);
        this.ctlPassword = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.ctlProfile = this.fb.control('', []);
        this.ctlBirthDate = this.fb.control('', []);
        this.ctlPhoneType = this.fb.control('', []);
        this.ctlPhoneNumber = this.fb.control('', []);
        this.frm = this.fb.group({
            _id: null,
            pseudo: this.ctlPseudo,
            password: this.ctlPassword,
            profile: this.ctlProfile,
            birthdate: this.ctlBirthDate,
        });

        this.frmPhone = this.fb.group({
            type: this.ctlPhoneType,
            number: this.ctlPhoneNumber
        });
    }

    // Validateur bidon qui vérifie que la valeur est différente
    forbiddenValue(val: string): any {
        return (ctl: FormControl) => {
            if (ctl.value === val) {
                return { forbiddenValue: { currentValue: ctl.value, forbiddenValue: val } };
            }
            return null;
        };
    }

    // Validateur asynchrone qui vérifie si le pseudo n'est pas déjà utilisé par un autre membre
    pseudoUsed(): any {
        let timeout;
        return (ctl: FormControl) => {
            clearTimeout(timeout);
            const pseudo = ctl.value;
            return new Promise(resolve => {
                timeout = setTimeout(() => {
                    if (ctl.pristine) {
                        resolve(null);
                    } else {
                        this.signupService.getOne(pseudo).subscribe(member => {
                            resolve(member ? { pseudoUsed: true } : null);
                        });
                    }
                }, 300);
            });
        };
    }

    ngOnInit() {
    }

    update() {
        console.log(this.frm.value);
        const data = this.frm.value;
        data.phones = this.phones;
        if (data._id === null) {
            this.signupService.add(data).subscribe(m => data._id = m._id);
            this.authService.login(this.frm.value.pseudo, this.frm.value.password).subscribe(() => {
                if (this.authService.isLoggedIn) {
                    // Get the redirect URL from our auth service
                    // If no redirect has been set, use the default
                    const redirect = this.authService.redirectUrl || '/home';
                    this.authService.redirectUrl = null;
                    // Redirect the user
                    this.router.navigate([redirect]);
                }
            });
        }
    }

    phoneAdd() {
        if (!this.phones) {
            this.phones = [];
        }
        this.phones.push(this.frmPhone.value);
        this.frmPhone.reset();
        this.frm.markAsDirty();
    }

    phoneDelete(phone) {
        _.remove(this.phones, phone);
        this.frm.markAsDirty();
    }
}
