import { Component, OnInit, ViewChild } from '@angular/core';
import { CategoryService, Category } from '../../../services/category.service';
import { MatTableDataSource, MatSort } from '@angular/material';
import { NgForm, FormGroup, FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { Book, BookService } from '../../../services/book.service';

@Component({
    selector: 'app-add-category-list',
    templateUrl: './add-category.component.html',
    styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit {

    displayedColumns: string[] = ['select', 'name'];
    dataSource: MatTableDataSource<Category>;
    selection = new SelectionModel<Category>(true, []);
    public frm: FormGroup;
    public ctlCategory: FormControl;
    public currentBook: Book;
    public cat: Category;
    //  @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private categoryService: CategoryService, private bookService: BookService, private fb: FormBuilder) {
        this.subscribeToEvent();
        this.ctlCategory = this.fb.control('', []);
        this.frm = this.fb.group({
            _id: null,
            name: this.ctlCategory
        });
    }


    ngOnInit() {
        this.refresh();
    }

    subscribeToEvent() {
        this.bookService.myMethod$.subscribe((book) => {
            this.currentBook = book;
            this.categoryService.getAllAvailable(this.currentBook.isbn).subscribe(cats => {
                this.dataSource = new MatTableDataSource(cats);
                this.dataSource.sort = this.sort;
            });
        });
        this.bookService.removeCatToNewBook.subscribe(c => {
            const data = this.dataSource.data;
            c.forEach(cat => data.push(cat));
            this.dataSource.data = data;
        });
    }

    refresh() {
        this.categoryService.getAllAvailable(this.currentBook.isbn).subscribe(cats => {
            this.dataSource = new MatTableDataSource(cats);
            this.dataSource.sort = this.sort;
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

    add() {
        const catToAdd = this.selection.selected;
        if (this.currentBook._id !== undefined) {
            this.addCatToBook(catToAdd);
        } else {
            this.addCatToNewBook(catToAdd);
        }
    }

    deletefrom(c: Category) {
        const data = this.dataSource.data;
        const index: number = data.indexOf(c);
        if (index !== -1) {
            data.splice(index, 1);
        }
        this.dataSource.data = data;
    }

    private addCatToNewBook(catToAdd: Category[]) {
        this.bookService.addCatToNewBookEvent(catToAdd);
        catToAdd.forEach(elem => {
            this.selection.deselect(elem);
            this.deletefrom(elem);
        });
    }

    private addCatToBook(catToAdd: Category[]) {
        catToAdd.forEach(elem => {
            this.currentBook.categories.push(elem);
            this.selection.deselect(elem);
        });
        this.bookService.update(this.currentBook).subscribe(m => this.bookService.myMethod(this.currentBook));
    }

}

