import { Injectable, Output, EventEmitter } from '@angular/core';
import { Observable, throwError, of, Subject, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { SecuredHttp } from './securedhttp.service';
import { Category } from './category.service';

export class Book {
    _id: string;
    isbn: string;
    title: string;
    author: string;
    picturePath: string;
    editor: string;
    categories: [Category];

    constructor(data) {
        this._id = data._id;
        this.isbn = data.isbn;
        this.title = data.title;
        this.author = data.author;
        this.editor = data.editor;
        this.picturePath = data.picturePath;
        this.categories = data.categories;
    }
}

const URL = '/api/books/';

@Injectable()
export class BookService {

    myMethod$: Observable<Book>;
    cat: Category[];

    private myMethodSubject = new BehaviorSubject<any>('');

    @Output() addCatToNewBook: EventEmitter<Category[]> = new EventEmitter();
    @Output() removeCatToNewBook: EventEmitter<Category[]> = new EventEmitter();


    addCatToNewBookEvent(catToAdd: Category[]) {
        this.cat = catToAdd;
        this.addCatToNewBook.emit(this.cat);
    }

    removeCatToNewBookEvent(catToRemove: Category[]) {
        this.cat = catToRemove;
        this.removeCatToNewBook.emit(this.cat);
    }

    constructor(private http: SecuredHttp) {
        this.myMethod$ = this.myMethodSubject.asObservable();
    }

    myMethod(data) {
        this.myMethodSubject.next(data);
    }


    public getAll(): Observable<Book[]> {
        return this.http.get<Book[]>(URL).pipe(
            map(res => res.map(m => new Book(m))),
            catchError(err => {
                console.error(err);
                return [];
            })
        );
    }

    public getOne(isbn: string): Observable<Book> {
        return this.http.get<Book[]>(URL + isbn).pipe(
            map(res => res.length > 0 ? new Book(res[0]) : null),
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }


    public getByExpression(value: string): Observable<Book[]> {
        return this.http.get<Book[]>(URL + 'exp/' + value).pipe(
            map(res => res.map(m => new Book(m))),
            catchError(err => {
                console.error(err);
                return [];
            })
        );
    }

    public update(m: Book): Observable<boolean> {
        return this.http.put<Book>(URL + m.isbn, m).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    public delete(m: Book): Observable<boolean> {
        return this.http.delete<boolean>(URL + m.isbn).pipe(
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    public add(m: Book): Observable<Book> {
        return this.http.post<Book>(URL, m).pipe(
            map(res => new Book(res)),
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }
    public addCategory(category: Array<Category>): Observable<Book> {
        return this.http.post<Book>(URL, category).pipe(
            map(res => new Book(res)),
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }

    public removeCat(currentBook: String, catToDelete: Category): Observable<boolean> {
        return this.http.post<boolean>(URL + 'removeCat', { catToDelete: catToDelete, isbn: currentBook }).pipe(
            map(result => {
                return true;
            }),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }
}
