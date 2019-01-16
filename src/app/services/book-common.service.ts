import { Injectable, Output, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Http, RequestOptions } from '@angular/http';
import { SecuredHttp } from './securedhttp.service';
import { Book } from './book.service';
import { Category } from 'src/app/services/category.service';

const URL = '/api/books-common/';

@Injectable()
export class BookCommonService {
    constructor(private http: SecuredHttp) {
    }

    book: Book;

    @Output() addBookInBasketEmit: EventEmitter<Book> = new EventEmitter();
    @Output() removeBookInBasketEmit: EventEmitter<Book> = new EventEmitter();
    @Output() clearBasketEmit: EventEmitter<Book> = new EventEmitter();
    @Output() editBookEmit: EventEmitter<Book> = new EventEmitter();
    // @Output() removeBookEmit: EventEmitter<Book> = new EventEmitter();


    addBookInBasket(book: Book) {
        this.book = book;
        this.addBookInBasketEmit.emit(this.book);
    }

    clearBasket() {
        this.clearBasketEmit.emit();
    }

    removeBookInBasket(book: Book) {
        this.book = book;
        this.removeBookInBasketEmit.emit(this.book);
    }

    editBook(book: Book) {
        this.book = book;
        this.editBookEmit.emit(this.book);
    }
    /*
        removeBook(book: Book) {
            this.book = book;
            this.removeBookEmit.emit(this.book);
        }
    */

    public getCount(): Observable<number> {
        return this.http.get<number>(URL + 'count').pipe(
            catchError(err => {
                console.error(err);
                return of(-1);
            })
        );
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

    public getAvailableBooks(): Observable<Book[]> {
        return this.http.get<Book[]>(URL + 'avalaible').pipe(
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

    public getBooksByCategory(id: String): Observable<Book[]> {
        return this.http.get<Book[]>(URL + 'category/' + id).pipe(
            map(res => res.map(m => new Book(m))),
            catchError(err => {
                console.error(err);
                return [];
            })
        );
    }

    public update_picture_path(isbn: string, path: string): Observable<boolean> {
        return this.http.put<Book>(URL, { picturePath: path }).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    public uploadPicture(isbn, file): Observable<string> {
        const formData = new FormData();
        formData.append('isbn', isbn);
        formData.append('picture', file);
        return this.http.post<string>(URL + 'upload', formData).pipe(
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }

    public confirmPicture(isbn, path): Observable<string> {
        console.log(isbn, path);
        return this.http.post<string>(URL + 'confirm', { isbn: isbn, picturePath: path }).pipe(
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
