import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { SecuredHttp } from './securedhttp.service';

@Injectable()
export class AuthService {
    isLoggedIn: boolean;

    // store the URL so we can redirect after logging in
    redirectUrl: string;

    constructor(private secHttp: SecuredHttp) {
        this.isLoggedIn = sessionStorage.getItem('id_token') != null;
    }

    login(username, password): Observable<boolean> {
        return this.secHttp.login(username, password).pipe(
            map(res => {
                this.isLoggedIn = res;
                return res;
            })
        );
    }

    logout(): void {
        this.isLoggedIn = false;
        this.secHttp.logout();
    }

    public get currentUser(): string {
        return sessionStorage.getItem('pseudo');
    }

    public get isAdmin(): boolean {
        return sessionStorage.getItem('admin') === 'true';
    }
}
