import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import * as _ from 'lodash';
import { AuthService } from '../../services/auth.service';
import { RentalCommonService } from '../../services/rental-common.service';
import { Rental } from '../../services/rental.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-current-rent-list',
    templateUrl: './current-rent-list.component.html',
    styleUrls: ['./current-rent-list.component.css']
})
export class CurrentRentListComponent implements OnInit {
    displayedColumns: string[] = ['orderDate', 'items'];
    dataSource: MatTableDataSource<Rental>;
    // currentUser: String;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(public authService: AuthService, private rentalCommonService: RentalCommonService,
    ) {
        this.refresh();
    }

    ngOnInit() {
    }

    refresh() {
        this.rentalCommonService.getAllWithoutReturnDate().subscribe(rentals => {
            this.dataSource = new MatTableDataSource(_.remove(rentals, m => m.member.pseudo === this.authService.currentUser));
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }

}
