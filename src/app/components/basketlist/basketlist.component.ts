import { Component, OnInit, ViewChild, HostBinding } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { Book, BookService } from '../../services/book.service';
import { Inject } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { EditBookComponent } from '../edit-book/edit-book.component';
import { AuthService } from '../../services/auth.service';
import { RentalCommonService } from '../../services/rental-common.service';
import { Rental } from '../../services/rental.service';
import { Member } from '../../services/member.service';
import { MemberCommonService } from '../../services/member-common.service';
import { Observable } from 'rxjs';
import { BookCommonService } from '../../services/book-common.service';
import { bind } from '@angular/core/src/render3/instructions';
import { FormControl, Validators } from '@angular/forms';
import { DetailBookComponent } from '../detailbook/detailbook.component';

@Component({
    selector: 'app-basketlist',
    templateUrl: './basketlist.component.html',
    styleUrls: ['./basketlist.component.css']
})

export class BasketListComponent implements OnInit {
    displayedColumns: string[] = ['isbn', 'title', 'editor', 'author', 'actions'];
    dataSource: MatTableDataSource<Book>;
    dataSourceRent: MatTableDataSource<Rental>;
    membersList: Member[];
    userRent: String;
    numberOfBook: number;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(public authService: AuthService, private rentalCommonService: RentalCommonService,
        private memberCommonService: MemberCommonService,
        private bookCommonService: BookCommonService,
        private bookService: BookService, public dialog: MatDialog, public snackBar: MatSnackBar) {

    }

    ngOnInit() {
        this.refresh();
        this.subscribeToEvent();
    }

    private subscribeToEvent() {
        this.bookCommonService.addBookInBasketEmit.subscribe(book => {
            const data = this.dataSource.data;
            data.push(book);
            this.dataSource.data = data;
            this.numberOfBook = this.dataSource.data.length + this.dataSourceRent.data.length;
        });
    }

    private refresh() {
        this.dataSource = new MatTableDataSource();
        if (this.authService.isAdmin) {
            this.configForAdmin();
        } else {
            this.configForUser();
        }
    }

    private configForAdmin() {
        this.getAllMembers();
        this.getRentalsForSelectedMember();
    }

    private getAllMembers() {
        this.memberCommonService.getAll().subscribe(
            members => {
                this.membersList = _.remove(members, m => m.admin === false);
                this.userRent = this.membersList[0].pseudo;
            });
    }

    private getRentalsForSelectedMember() {
        this.rentalCommonService.getAll().subscribe(
            rentals => {
                this.dataSourceRent = new MatTableDataSource(
                    _.remove(rentals, m => m.member.pseudo === this.userRent));
            });
    }

    private configForUser() {
        this.userRent = this.authService.currentUser;
        // REMPLACE LIGNES DU DESSOUS
        this.getRentalsForSelectedMember();
        /*
        this.rentalCommonService.getAll().subscribe(
            rentals => {
                this.dataSourceRent = new MatTableDataSource(
                    _.remove(rentals, m => m.member.pseudo === this.authService.currentUser));
            });
        */

    }

    private cancelRent(book: Book) {
        this.bookCommonService.removeBookInBasket(book);
        this.deleteFromDataSource(book);
        this.numberOfBook = this.dataSource.data.length + this.dataSourceRent.data.length;
    }

    private deleteFromDataSource(book: Book) {
        const data = this.dataSource.data;
        const index: number = data.indexOf(book);
        if (index !== -1) {
            data.splice(index, 1);
        }
        this.dataSource.data = data;
    }

    private cancelBasket() {
        this.numberOfBook = this.numberOfBook - this.dataSource.data.length;
        this.bookCommonService.clearBasket();
        this.refresh();
    }

    private confirmBasket() {
        this.rentalCommonService.add(this.userRent, this.dataSource.data).subscribe();
        this.refresh();
    }

    private checkRent() {
        this.userRent = this.userRent;
        this.rentalCommonService.getAll().subscribe(rentals => {
            this.dataSourceRent = new MatTableDataSource(_.remove(rentals, m => m.member.pseudo === this.userRent));
            this.numberOfBook = this.dataSource.data.length + this.dataSourceRent.data.length;
        });
    }

    private edit(book: Book) {
        this.bookCommonService.editBook(book);
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

}
