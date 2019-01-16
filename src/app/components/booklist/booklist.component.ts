import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { Book, BookService } from '../../services/book.service';
import { Inject } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { EditBookComponent } from '../edit-book/edit-book.component';
import { AuthService } from '../../services/auth.service';
import { BookCommonService } from '../../services/book-common.service';
import { DetailBookComponent } from '../detailbook/detailbook.component';
import { Category, CategoryService } from 'src/app/services/category.service';

@Component({
    selector: 'app-booklist-mat',
    templateUrl: './booklist.component.html',
    styleUrls: ['./booklist.component.css']
})
export class BookListComponent implements OnInit {
    displayedColumns: string[] = ['isbn', 'title', 'editor', 'author', 'actions'];
    dataSource: MatTableDataSource<Book>;
    selectedValue: String;
    categories: Category[];
    bookInBasket: Book[] = [];
    filter: string;


    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(public authService: AuthService, private bookService: BookService,
        private bookCommonService: BookCommonService, private categoryService: CategoryService,
        public dialog: MatDialog, public snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this.refresh();
        this.subscribeToEvents();
    }

    createFilter(): (data: any, filter: string) => boolean { // reconfigurer la fonction filtre du datasource
        const filterFunction = function (data, filter): boolean {
            const searchTerms = filter;
            return  data.isbn.trim().toLowerCase().indexOf(searchTerms.trim().toLowerCase()) !== -1
            || data.editor.trim().toLowerCase().indexOf(searchTerms.trim().toLowerCase()) !== -1
            || data.title.trim().toLowerCase().indexOf(searchTerms.trim().toLowerCase()) !== -1
            || data.author.trim().toLowerCase().indexOf(searchTerms.trim().toLowerCase()) !== -1
            ;
        };
        return filterFunction;
    }

    private subscribeToEvents() {
        this.subscribeToRemoveBookInBasket();
        this.subscribeToClearBasket();
        this.subscribeToEdit();
    }

    private subscribeToRemoveBookInBasket() {
        this.bookCommonService.removeBookInBasketEmit.subscribe(book => {
            this.checkIfBookInFilter(book);
            const index: number = this.bookInBasket.indexOf(book);
            if (index !== -1) {
                this.bookInBasket.splice(index, 1);
            }
        });
    }

    private checkIfBookInFilter(book: Book) {
        let addbook = false;
        book.categories.forEach(c => {
            if (c.name === this.selectedValue || this.selectedValue === null) {
                addbook = true;
            }
        });
        if (addbook) {
            const data = this.dataSource.data;
            data.push(book);
            this.dataSource.data = data;
        }
        if (this.filter !== undefined) {
            this.applyFilter(this.filter);
        }
    }

    private subscribeToClearBasket() {
        this.bookCommonService.clearBasketEmit.subscribe(
            book => {
                this.refresh();
                this.bookInBasket = [];
            }
        );
    }

    private subscribeToEdit() {
        this.bookCommonService.editBookEmit.subscribe(
            b => {
                this.edit(b);
            });
    }

    private rent(book: Book) {
        this.bookCommonService.addBookInBasket(book);
        this.deletefrom(book);
    }

    private edit(book: Book) {
        if (this.authService.isAdmin) {
            this.dialogAdmin(book);
        } else {
            this.dialogUser(book);
        }
    }

    private deletefrom(book: Book) {
        const data = this.dataSource.data;
        const index: number = data.indexOf(book);
        if (index !== -1) {
            data.splice(index, 1);
        }
        this.dataSource.data = data;
        this.bookInBasket.push(book);
    }

    private refresh() {
        this.bookCommonService.getAvailableBooks().subscribe(books => {
            this.configDataSource(books);
            this.selectedValue = null;
            if (this.filter !== undefined) {
                this.applyFilter(this.filter);
            }
        });
    }

    private refreshOnCategory() {
        this.bookCommonService.getBooksByCategory(this.selectedValue).subscribe(books => {
            this.configDataSource(books);
            if (this.filter !== undefined) {
                this.applyFilter(this.filter);
            }
        });
    }

    private configDataSource(books: Book[]) {
        this.dataSource = new MatTableDataSource(books);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = this.createFilter();
        this.getCategory();
        this.filterBookAlreadyInBasket();
    }

    private filterBookAlreadyInBasket() {
        this.bookInBasket.forEach(book => {
            this.dataSource.data = _.filter(this.dataSource.data, m => m.isbn !== book.isbn);
        });
    }

    private getCategory() {
        this.categoryService.getAll().subscribe(cats => {
            this.categories = cats;
        });
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
        this.filter = filterValue;
    }

    private dialogAdmin(book: Book) {
        const dlg = this.dialog.open(EditBookComponent, { data: book });
        this.closeDialog(dlg, book);

    }

    private dialogUser(book: Book) {
        const dlg = this.dialog.open(DetailBookComponent, { data: book });
        this.closeDialog(dlg, book);
    }

    private closeDialog(dlg: any, book: Book) {
        dlg.beforeClose().subscribe(res => {
            if (res) {
                _.assign(book, res);
            }
        });
    }

    private delete(book: Book) {
        const backup = this.dataSource.data;
        this.dataSource.data = _.filter(this.dataSource.data, m => m._id !== book._id);
        const snackBarRef = this.snackBar.open(`Book '${book.title}' will be deleted`, 'Undo', { duration: 10000 });
        snackBarRef.afterDismissed().subscribe(res => {
            if (!res.dismissedByAction) {
                this.bookService.delete(book).subscribe();
            } else {
                this.dataSource.data = backup;
            }
        });
    }

    private create() {
        const book = new Book({});
        const dlg = this.dialog.open(EditBookComponent, { data: book });
        dlg.beforeClose().subscribe(res => {
            if (res) {
                this.dataSource.data = [...this.dataSource.data, res];
            }
        });
    }

}
