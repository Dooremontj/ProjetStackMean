import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { SecuredHttp } from './securedhttp.service';
import { Book } from './book.service';

export class Category {
    _id: string;
    name: String;
    books: [Book];


    constructor(data) {
        this._id = data._id;
        this.name = data.name;
        this.books = data.books;

    }
}



const URL = '/api/category/';

@Injectable()
export class CategoryService {
    constructor(private http: SecuredHttp) {
    }

    public getAll(): Observable<Category[]> {
        return this.http.get<Category[]>(URL).pipe(
            map(res => res.map(m => new Category(m))),
            catchError(err => {
                console.error(err);
                return [];
            })
        );
    }

    public getOne(id: string): Observable<Category> {
        return this.http.get<Book[]>(URL + id).pipe(
            map(res => res.length > 0 ? new Book(res[0]) : null),
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }

    public getAllAvailable(isbn: string): Observable<Category[]> {
        return this.http.get<Category[]>(URL + 'available/' + isbn).pipe(
            map(res => res.map(m => new Category(m))),
            catchError(err => {
                console.error(err);
                return [];
            })
        );
    }

    public update(m: Category): Observable<boolean> {
        return this.http.put<Category>(URL + m.name, m).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    public delete(m: Category): Observable<boolean> {
        return this.http.delete<boolean>(URL + m._id).pipe(
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    public add(m: Category): Observable<Category> {
        return this.http.post<Category>(URL, m).pipe(
            map(res => new Category(res)),
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }
}
