import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { SecuredHttp } from './securedhttp.service';
import { Member } from './member.service';
import { Book } from './book.service';

export class Rental {
    _id: string;
    orderDate: string;
    member: Member;
    items: [{ book: Book, date: string }];

    constructor(data) {
        this._id = data._id;
        this.orderDate = data.orderDate;
        this.member = data.member;
        this.items = data.items;
    }
}
