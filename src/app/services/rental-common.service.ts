import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Http, RequestOptions } from '@angular/http';
import { SecuredHttp } from './securedhttp.service';
import { Rental } from './rental.service';
import { Book } from './book.service';

const URL = '/api/rental-common/';

@Injectable()
export class RentalCommonService {
    constructor(private http: SecuredHttp) {
    }

    public getAll(): Observable<Rental[]> {
        return this.http.get<Rental[]>(URL).pipe(
            map(res => res.map(m => m)),
            catchError(err => {
                console.error(err);
                return [];
            })
        );
    }

    public getAllWithoutReturnDate(): Observable<Rental[]> {
        return this.http.get<Rental[]>(URL + 'forMember/').pipe(
            map(res => res.map(m => new Rental(m))),
            catchError(err => {
                console.error(err);
                return [];
            })
        );
    }

    public getCount(member: string): Observable<Rental[]> {
        return this.http.get<Rental[]>(URL + 'numberOfRent/' + member).pipe(
            map(res => res.map( m => m)),
            catchError(err => {
                console.error(err);
                return [];
            })
        );
    }

    public delete(id: string): Observable<boolean> {
        return this.http.delete<boolean>(URL + id).pipe(
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    public update(m: any): Observable<boolean> {
        return this.http.put<any>(URL + m._id, m).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////

    public add(currentUser: String, basket: Book[]): Observable<boolean> {
        return this.http.post(URL + 'rent', { basket: basket, pseudo: currentUser }).pipe(
            map(result => {
                return true;
            }),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
}
