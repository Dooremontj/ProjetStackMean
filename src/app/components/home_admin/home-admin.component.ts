import { Component, OnInit, ViewChild } from '@angular/core';
import {
    MatPaginator, MatSort,
    MatTableDataSource, MatDialog, MatSnackBar
} from '@angular/material';
import * as _ from 'lodash';
import { AuthService } from '../../services/auth.service';
import { RentalCommonService } from '../../services/rental-common.service';
import { BookService } from '../../services/book.service';
import { FormControl } from '@angular/forms';
import { EditRentComponent } from '../edit-rent/edit-rent.component';

@Component({
    selector: 'app-home-admin',
    templateUrl: './home-admin.component.html',
    styleUrls: ['./home-admin.component.css']
})
export class HomeAdminComponent implements OnInit {
    displayedColumns: string[] = ['orderDate', 'member', 'book', 'returnDate', 'actions'];
    dataSource: MatTableDataSource<any>;
    memberFilter = new FormControl('');
    bookFilter = new FormControl('');
    dateFilter = new FormControl('');
    stateFilter = new FormControl('');
    filterValues = {
        member: '',
        book: '',
        date: null,
        state: null
    };

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(public authService: AuthService, private rentalCommonService: RentalCommonService,
        public snackBar: MatSnackBar, public dialog: MatDialog,
    ) { }

    ngOnInit() {
        this.refresh();
        this.filterMember();
        this.filterBook();
        this.filterState();
        this.filterDate();
    }

    private filterMember() {
        this.memberFilter.valueChanges
            .subscribe(
                member => {
                    this.filterValues.member = member;
                    this.dataSource.filter = JSON.stringify(this.filterValues);
                }
            );
    }

    private filterBook() {
        this.bookFilter.valueChanges
            .subscribe(
                book => {
                    this.filterValues.book = book;
                    this.dataSource.filter = JSON.stringify(this.filterValues);
                }
            );
    }

    private filterState() {
        this.stateFilter.valueChanges
            .subscribe(
                state => {
                    this.filterValues.state = state;
                    this.dataSource.filter = JSON.stringify(this.filterValues);
                }
            );
    }

    private filterDate() {
        this.dateFilter.valueChanges
            .subscribe(
                date => {
                    this.filterValues.date = date;
                    this.dataSource.filter = JSON.stringify(this.filterValues);
                }
            );
    }

    refresh() {
        this.rentalCommonService.getAll().subscribe(rentals => {
            this.dataSource = new MatTableDataSource(rentals);
            this.dataSource.paginator = this.paginator;
            this.dataSource.filterPredicate = this.createFilter();
            this.configSortDataSource();
        });
    }

    configSortDataSource() {
        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'book': return item.book.title;
                case 'member': return item.member.pseudo;
                default: return item[property];
            }
        };
        this.dataSource.sort = this.sort;
    }

    createFilter(): (data: any, filter: string) => boolean { // reconfigurer la fonction filtre du datasource
        const filterFunction = function (data, filter): boolean {
            const searchTerms = JSON.parse(filter);
            const book = data.book.isbn + ' ' + data.book.title + ' ' + data.book.author + ' ' + data.book.editor;
            return data.member.pseudo.toLowerCase().indexOf(searchTerms.member.trim().toLowerCase()) !== -1
                && book.trim().toLowerCase().indexOf(searchTerms.book.trim().toLowerCase()) !== -1
                && (searchTerms.date === null
                    ||
                    new Date(data.orderDate).setHours(0, 0, 0, 0) === new Date(searchTerms.date).setHours(0, 0, 0, 0))
                && ((searchTerms.state === '1' && data.returnDate === null)
                    ||
                    (searchTerms.state === '2' && data.returnDate !== null)
                    ||
                    (searchTerms.state === '3' || searchTerms.state === null)
                );
        };
        return filterFunction;
    }

    private delete(rental: any) {
        const backup = this.dataSource.data;
        this.dataSource.data = _.filter(this.dataSource.data, m => m._id !== rental._id);
        const snackBarRef = this.snackBar.open(`Rent '${rental.orderDate + ' from ' + rental.member.pseudo + ' with book : '
            + rental.book.title}'
            will be deleted`, 'Undo', { duration: 10000 });
        snackBarRef.afterDismissed().subscribe(res => {
            if (!res.dismissedByAction) {
                this.rentalCommonService.delete(rental._id).subscribe();
            } else {
                this.dataSource.data = backup;
            }
        });
    }

    private edit(rent: any) {
        const dlg = this.dialog.open(EditRentComponent, { data: rent });
        dlg.beforeClose().subscribe(res => {
            if (res) {
                _.assign(rent, res);
            }
        });
    }

}
