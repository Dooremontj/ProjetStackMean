import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import { Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';

import { BookCommonService } from '../../services/book-common.service';
import { BookService, Book } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { ArrayDataSource } from '@angular/cdk/collections';
import { Category } from 'server/models/category';
import { RentalCommonService } from '../../services/rental-common.service';

@Component({
    selector: 'app-edit-rent-mat',
    templateUrl: './edit-rent.component.html',
    styleUrls: ['./edit-rent.component.css']
})
export class EditRentComponent implements OnInit {
    public frm: FormGroup;
    private dataToUpdate;
    public orderDate;
    public member;
    public book;
    public ctlreturnDate: FormControl;


    constructor(public dialogRef: MatDialogRef<EditRentComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        public rentalCommonService: RentalCommonService, public authService: AuthService) {
        this.ctlreturnDate = this.fb.control('', []);
        this.frm = this.fb.group({
            returnDate: this.ctlreturnDate,
        });

        if (data.returnDate === null) {
            this.ctlreturnDate = new FormControl(new Date().toISOString());
        } else if (data.returnDate !== null) {
            this.ctlreturnDate = new FormControl(new Date(data.returnDate));
        }
        this.dataToUpdate = data;
        this.member = data.member.pseudo;
        this.book = data.book.title;
        this.orderDate = moment(data.orderDate).format('DD-MM-YYYY');
        this.frm.patchValue(data);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
    }

    cancel() {
        this.dataToUpdate.returnDate = null;
        this.rentalCommonService.update(this.dataToUpdate).subscribe();
        this.dialogRef.close();
    }

    update() {
        this.dataToUpdate.returnDate = moment(this.ctlreturnDate.value).format('YYYY-MM-DD HH:mm:ss');
        this.rentalCommonService.update(this.dataToUpdate).subscribe();
    }

}
