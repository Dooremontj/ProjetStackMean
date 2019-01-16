import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';
import { NgForm, FormGroup, FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { Book, BookService } from '../../../services/book.service';
import { Category } from 'src/app/services/category.service';

@Component({
    selector: 'app-remove-category-list',
    templateUrl: './remove-category.component.html',
    styleUrls: ['./remove-category.component.css']
})
export class RemoveCategoryComponent implements OnInit {

    displayedColumns: string[] = ['select', 'title'];
    dataSource: MatTableDataSource<Category>;

    selection = new SelectionModel<Category>(true, []);
    public frm: FormGroup;
    public ctlCategory: FormControl;
    bookSent: Book;

    //  @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private bookService: BookService, private fb: FormBuilder) {
        // sert a recevoir un livre
        this.subscribeToEvent();
    }


    ngOnInit() {
        this.refresh();
    }

    private subscribeToEvent() {
        this.bookService.myMethod$.subscribe((book) => {
            this.bookSent = book;
            this.refresh();
        });
        this.bookService.addCatToNewBook.subscribe(c => this.dataSource.data = c);
    }

    refresh() {
        this.dataSource = new MatTableDataSource(this.bookSent.categories);
        this.ctlCategory = this.fb.control('', []);
        this.frm = this.fb.group({
            _id: null,
            name: this.ctlCategory
        });
        this.selection.clear();
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    remove() {
        const catToDelete = this.selection.selected;
        if (this.bookSent._id !== undefined) {
            this.removeCatToBook(catToDelete);
        } else {
            this.removeCatToNewBook(catToDelete);
        }
    }

    private removeCatToBook(catToDelete: Category[]) {
        catToDelete.forEach(elem => {
            const number: number = this.bookSent.categories.indexOf(elem);
            this.bookSent.categories.splice(number, 1);
        });
        catToDelete.forEach(c =>
            this.bookService.removeCat(this.bookSent.isbn, c).subscribe(m => this.bookService.myMethod(this.bookSent)));
    }

    private removeCatToNewBook(catToDelete: Category[]) {
        this.bookService.removeCatToNewBookEvent(catToDelete);
        catToDelete.forEach(c => {
            this.deletefrom(c);
            this.selection.deselect(c);
        });
    }

    deletefrom(c: Category) {
        const data = this.dataSource.data;
        const index: number = data.indexOf(c);
        if (index !== -1) {
            data.splice(index, 1);
        }
        this.dataSource.data = data;
    }

}

