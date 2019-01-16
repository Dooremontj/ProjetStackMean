import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { SecuredHttp } from './securedhttp.service';
import { Rental } from './rental.service';

export class Member {
    _id: string;
    pseudo: string;
    password: string;
    profile: string;
    birthdate: string;
    admin: boolean;
    picturePath: string;
    phones: [{ type: string, number: string }];

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    rentals: Rental;


    constructor(data) {
        this._id = data._id;
        this.pseudo = data.pseudo;
        this.password = data.password;
        this.profile = data.profile;
        this.birthdate = data.birthdate &&
            data.birthdate.length > 10 ? data.birthdate.substring(0, 10) : data.birthdate;
        this.admin = data.admin;
        this.picturePath = data.picturePath;
        this.phones = data.phones;

        //////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////
        this.rentals = data.rentals;
    }
}

const URL = '/api/members/';

@Injectable()
export class MemberService {
    constructor(private http: SecuredHttp) {
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

    public update(m: Member): Observable<boolean> {
        return this.http.put<Member>(URL + m.pseudo, m).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    public delete(m: Member): Observable<boolean> {
        return this.http.delete<boolean>(URL + m.pseudo).pipe(
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    public add(m: Member): Observable<Member> {
        return this.http.post<Member>(URL, m).pipe(
            map(res => new Member(res)),
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }
}
