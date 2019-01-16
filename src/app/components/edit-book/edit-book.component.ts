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
    selector: 'app-edit-book-mat',
    templateUrl: './edit-book.component.html',
    styleUrls: ['./edit-book.component.css']
})
export class EditBookComponent implements OnInit {
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


    constructor(public dialogRef: MatDialogRef<EditBookComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Book,

        private fb: FormBuilder,
        private bookService: BookService,
        private bookCommonService: BookCommonService, public authService: AuthService) {
        this.bookService.myMethod(this.data);
        this.configVariable();
        this.configForm();
        this.frm.patchValue(data);
        this.cat = data.categories;
        this.tempPicturePath = data.picturePath;
        this.bookService.addCatToNewBook.subscribe(c => this.categories = c);
    }

    // Validateur bidon qui vérifie que la valeur est différente
    forbiddenValue(val: string): any {
        return (ctl: FormControl) => {
            if (ctl.value === val) {
                return { forbiddenValue: { currentValue: ctl.value, forbiddenValue: val } };
            }
            return null;
        };
    }

    private configVariable() {
        this.ctlIsbn = this.fb.control('', [Validators.required, Validators.minLength(3),
        this.forbiddenValue('abc')], [this.isbnUsed()]);
        this.ctlEditor = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.ctlTitle = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.ctlAuthor = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.ctlCategory = this.fb.control('', []);
    }

    private configForm() {
        this.frm = this.fb.group({
            _id: null,
            isbn: this.ctlIsbn,
            editor: this.ctlEditor,
            title: this.ctlTitle,
            author: this.ctlAuthor,
            categories: null
        });
    }

    // Validateur asynchrone qui vérifie si le isbn n'est pas déjà utilisé par un autre membre
    isbnUsed(): any {
        let timeout;
        return (ctl: FormControl) => {
            clearTimeout(timeout);
            const isbn = ctl.value;
            return new Promise(resolve => {
                timeout = setTimeout(() => {
                    if (ctl.pristine) {
                        resolve(null);
                    } else {
                        this.bookCommonService.getOne(isbn).subscribe(book => {
                            resolve(book ? { isbnUsed: true } : null);
                        });
                    }
                }, 300);
            });
        };
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
    }

    update() {
        const data = this.frm.value;
        if (this.tempPicturePath && !this.tempPicturePath.endsWith(data.isbn)) {
            this.bookCommonService.confirmPicture(data.isbn, this.tempPicturePath).subscribe();
            data.picturePath = 'uploads/' + data.isbn;
        }
        if (data._id === undefined) {
            data.categories = this.categories;
            this.bookService.add(data).subscribe(m => data._id = m._id);
        } else {
            this.bookService.update(data).subscribe();
        }
        this.dialogRef.close(data);
    }

    cancelTempPicture() {
        const data = this.frm.value;
        if (this.tempPicturePath && !this.tempPicturePath.endsWith(data.isbn)) {
            this.bookCommonService.cancelPicture(this.tempPicturePath).subscribe();
        }
    }

    cancel() {
        this.cancelTempPicture();
        this.dialogRef.close();
    }

    fileChange(event) {
        const fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            const file = fileList[0];
            this.bookCommonService.uploadPicture(this.frm.value.isbn || 'empty', file).subscribe(path => {
                this.cancelTempPicture();
                this.tempPicturePath = path;
                this.frm.markAsDirty();
            });
        }
    }

    get picturePath(): string {
        // Le compteur updateCounter sert à générer un URL différent quand on change d'image
        // car sinon l'image ne se rafraîchit pas parce que l'url ne change pas.
        return this.tempPicturePath && this.tempPicturePath !== '' ?
            (this.tempPicturePath + '?' + this.updateCounter) : 'uploads/unknown-user.jpg';
    }
}
