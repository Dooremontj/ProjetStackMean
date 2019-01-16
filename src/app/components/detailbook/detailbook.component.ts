import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import * as _ from 'lodash';
import { BookCommonService } from '../../services/book-common.service';
import { BookService, Book } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { ArrayDataSource } from '@angular/cdk/collections';
import { Category } from 'server/models/category';

@Component({
    selector: 'app-detail-book-mat',
    templateUrl: './detailbook.component.html',
    styleUrls: ['./detailbook.component.css']
})
export class DetailBookComponent implements OnInit {
    public frm: FormGroup;
    public frmCategory: FormGroup;
    public ctlIsbn: FormControl;
    public ctlTitle: FormControl;
    public ctlEditor: FormControl;
    public ctlAuthor: FormControl;
    public ctlCategory: FormControl;
    public cat = null;

    public categories;
    private updateCounter = new Date().getTime();
    private tempPicturePath: string;

    constructor(public dialogRef: MatDialogRef<DetailBookComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Book,
        private fb: FormBuilder,
        public authService: AuthService) {
        this.configVariable();
        this.configForm();
        this.frm.patchValue(data);
        this.cat = data.categories;
        this.tempPicturePath = data.picturePath;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
    }

    private configVariable() {
        this.ctlIsbn = this.fb.control('', []);
        this.ctlEditor = this.fb.control('', []);
        this.ctlTitle = this.fb.control('', []);
        this.ctlAuthor = this.fb.control('', []);
        this.ctlCategory = this.fb.control('', []);
    }

    private configForm() {
        this.frm = this.fb.group({
            _id: null,
            isbn: this.ctlIsbn,
            editor: this.ctlEditor,
            title: this.ctlTitle,
            author: this.ctlAuthor,
        });
        this.frmCategory = this.fb.group({
            categories: this.ctlCategory,
        });
    }

    get picturePath(): string {
        // Le compteur updateCounter sert à générer un URL différent quand on change d'image
        // car sinon l'image ne se rafraîchit pas parce que l'url ne change pas.
        return this.tempPicturePath && this.tempPicturePath !== '' ?
            (this.tempPicturePath + '?' + this.updateCounter) : 'uploads/unknown-user.jpg';
    }
}
