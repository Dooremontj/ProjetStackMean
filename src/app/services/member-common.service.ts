import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Http, RequestOptions } from '@angular/http';
import { SecuredHttp } from './securedhttp.service';
import { Member } from './member.service';

const URL = '/api/members-common/';

@Injectable()
export class MemberCommonService {
    constructor(private http: SecuredHttp) {
    }

    public getCount(): Observable<number> {
        return this.http.get<number>(URL + 'count').pipe(
            catchError(err => {
                console.error(err);
                return of(-1);
            })
        );
    }

    public getAll(): Observable<Member[]> {
        return this.http.get<Member[]>(URL).pipe(
            map(res => res.map(m => new Member(m))),
            catchError(err => {
                console.error(err);
                return [];
            })
        );
    }

    public getOne(pseudo: string): Observable<Member> {
        return this.http.get<Member[]>(URL + pseudo).pipe(
            map(res => res.length > 0 ? new Member(res[0]) : null),
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }

    public update_picture_path(pseudo: string, path: string): Observable<boolean> {
        return this.http.put<Member>(URL, { picturePath: path }).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    public uploadPicture(pseudo, file): Observable<string> {
        const formData = new FormData();
        formData.append('pseudo', pseudo);
        formData.append('picture', file);
        return this.http.post<string>(URL + 'upload', formData).pipe(
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }

    public confirmPicture(pseudo, path): Observable<string> {
        console.log(pseudo, path);
        return this.http.post<string>(URL + 'confirm', { pseudo: pseudo, picturePath: path }).pipe(
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }

    public cancelPicture(path): Observable<string> {
        return this.http.post<string>(URL + 'cancel', { picturePath: path }).pipe(
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }
}
