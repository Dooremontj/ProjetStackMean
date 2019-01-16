import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of } from 'rxjs';
import { map, flatMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export const BASE_URL = environment.production ? '/' : '/';

const URL = BASE_URL;

@Injectable()
export class SecuredHttp {
    /**
     * Instance privée de ce helper qui nous aidera à vérifier si
     * un token est expiré ou non.
     */
    private jwt: JwtHelperService = new JwtHelperService();

    /**
     * Ici on a besoin à la fois du service HttpClient pour accéder aux URL non sécurisées
     * (en l'occurence /api/token).
     */
    constructor(private http: HttpClient) {
    }

    /**
     * Cette méthode permet de faire le login en interaction avec le serveur.
     * Elle reçoit en paramètres les credentials de l'utilisateur.
     */
    public login(username, password): Observable<boolean> {
        // headers nécessaire pour le post
        const headers: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        // requête POST non sécurisée pour demander un token
        return this.http.post<any>(URL + 'api/token',
            'pseudo=' + encodeURIComponent(username) +
            '&password=' + encodeURIComponent(password),
            { headers: headers })
            .pipe(
                map(data => {
                    if (data.success) {
                        // si les credentials sont corrects, on reçoit une réponse qui contient le token
                        const token = data.token;
                        console.log('TOKEN_RENEWED');
                        // le login est bon : on stocke les credentials et le token dans le sessionStorage
                        sessionStorage.setItem('pseudo', username);
                        sessionStorage.setItem('password', password);
                        sessionStorage.setItem('id_token', token);
                        sessionStorage.setItem('admin', data.admin);
                        return true;
                    } else {
                        return false;
                    }
                }),
                catchError(res => {
                    return of(false);
                })
            );
    }

    /**
     * Pour faire le logout, il suffit de supprimer toutes les infos stockées dans le sessionStorage.
     */
    public logout(): void {
        sessionStorage.removeItem('pseudo');
        sessionStorage.removeItem('password');
        sessionStorage.removeItem('id_token');
        sessionStorage.removeItem('admin');
    }

    /**
     * On définit les 4 méthodes get, delete, post et put qui correspondent aux 4
     * requêtes HTTP correspondantes. Chacune de ces méthodes se contente d'appeler
     * la méthode call() en lui passant une fonction qui permettra d'exécuter la
     * requêtre HTTP via AuthHttp.
     *
     * Voir rôle de call() ci-dessous.
     */

    public get<T>(url: string, options?: HttpHeaders): Observable<T> {
        return this.call(() => this.http.get(url, { headers: options }));
    }

    public delete<T>(url: string, options?: HttpHeaders): Observable<T> {
        return this.call(() => this.http.delete(url, { headers: options }));
    }

    public post<T>(url: string, body: any, options?: HttpHeaders): Observable<T> {
        return this.call(() => this.http.post(url, body, { headers: options }));
    }

    public put<T>(url: string, body: any, options?: HttpHeaders): Observable<T> {
        return this.call(() => this.http.put(url, body, { headers: options }));
    }

    /**
     * Le but de la méthode call() est de préalablement vérifier si le token existe
     * et s'il n'est pas expiré. S'il est expiré, elle en redemande un nouveau. Ensuite
     * elle exécute la fonction lambda (func) qu'elle a reçue en paramètre et qui, elle,
     * fait réellement appel au serveur via AuthHttp. De cette manière, on peut appeler
     * les méthodes ci-dessus sans se préoccuper de vérifier si le token est encore
     * valide. Cette vérification est faite de manière automatique et transparente pour
     * le code qui utilise ce service.
     */
    private call<T>(func): Observable<T> {
        // Récupère le token depuis le sessionStorage
        const token = sessionStorage.getItem('id_token');
        // Si le token n'existe pas ou s'il est expiré ...
        if (!token || this.jwt.isTokenExpired(token)) {
            const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
            // on demande un nouveau token
            return this.http.post<any>(URL + 'api/token',
                'pseudo=' + encodeURIComponent(sessionStorage.getItem('pseudo')) +
                '&password=' + encodeURIComponent(sessionStorage.getItem('password')),
                { headers: headers }).pipe(
                    // L'opérateur flatMap permet ici d'enchaîner les requêtes en utilisant
                    // le résultat de la première pour effectuer la seconde.
                    // Voir http://stackoverflow.com/a/35268597
                    flatMap(res => {
                        // on reçoit le token du serveur
                        const newToken = res.token;
                        console.log('TOKEN_RENEWED');
                        // on le stocke dans sessionStorage
                        sessionStorage.setItem('id_token', newToken);
                        // on peut maintenant, finalement, faire l'appel à l'API protégée
                        return func();
                    })
                );
        } else {
            // si le token est valide et n'est pas expiré, on peut directement
            // faire appel à l'API protégée
            return func();
        }
    }
}
