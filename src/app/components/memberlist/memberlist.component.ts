import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { Member, MemberService } from '../../services/member.service';
import { Inject } from '@angular/core';
import { EditMemberComponent } from '../edit-member/edit-member.component';
import * as moment from 'moment';
import * as _ from 'lodash';
import { RentalCommonService } from '../../services/rental-common.service';

@Component({
    selector: 'app-memberlist-mat',
    templateUrl: './memberlist.component.html',
    styleUrls: ['./memberlist.component.css']
})
export class MemberListComponent implements OnInit {
    displayedColumns: string[] = ['pseudo', 'profile', 'birthdate', 'admin', 'actions'];
    dataSource: MatTableDataSource<Member>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private memberService: MemberService, public dialog: MatDialog,
        private rentalCommonService: RentalCommonService, public snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        this.memberService.getAll().subscribe(members => {
            this.dataSource = new MatTableDataSource(members);
            this.dataSource.paginator = this.paginator;
            this.dataSource.filterPredicate = this.createFilter();
            this.dataSource.sort = this.sort;
        });
    }

    createFilter(): (data: any, filter: string) => boolean { // reconfigurer la fonction filtre du datasource
        const filterFunction = function (data, filter): boolean {
            const searchTerms = filter;
            let profile;
            let birthdate;
            if (data.profile !== undefined) {
                profile = data.profile.trim().toLowerCase().indexOf(searchTerms.trim().toLowerCase()) !== -1;
            }
            if (data.birthdate !== undefined) {
                birthdate = data.birthdate.trim().toLowerCase().indexOf(searchTerms.trim().toLowerCase()) !== -1;
            }
            return data.pseudo.trim().toLowerCase().indexOf(searchTerms.trim().toLowerCase()) !== -1
                || profile
                || birthdate
                ;
        };
        return filterFunction;
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    private edit(member: Member) {
        const dlg = this.dialog.open(EditMemberComponent, { data: member });
        dlg.beforeClose().subscribe(res => {
            if (res) {
                _.assign(member, res);
            }
        });
    }

    private delete(member: Member) {
        this.checkIfCanDeleteMember(member);
        /*
            const backup = this.dataSource.data;
            this.dataSource.data = _.filter(this.dataSource.data, m => m._id !== member._id);
            const snackBarRef = this.snackBar.open(`Member '${member.pseudo}' will be deleted`, 'Undo', { duration: 10000 });
            snackBarRef.afterDismissed().subscribe(res => {
                if (!res.dismissedByAction) {
                    this.memberService.delete(member).subscribe();
                } else {
                    this.dataSource.data = backup;
                }
            });
            */
    }

    private checkIfCanDeleteMember(member: Member) /*: boolean*/ {
        let dataSourceRent: MatTableDataSource<any>;
        this.rentalCommonService.getCount(member.pseudo).subscribe(rentals => {
            dataSourceRent = new MatTableDataSource(rentals);
            console.log(dataSourceRent.data.length);

            if (dataSourceRent.data.length === 0) {
                this.deleteMember(member);
            } else {
                this.cantDeleteMember(member, dataSourceRent.data.length);
            }
        });
        // return false;
    }

    private deleteMember(member: Member){
        const backup = this.dataSource.data;
        this.dataSource.data = _.filter(this.dataSource.data, m => m._id !== member._id);
        const snackBarRef = this.snackBar.open(`Member '${member.pseudo}' will be deleted`, 'Undo', { duration: 10000 });
        snackBarRef.afterDismissed().subscribe(res => {
            if (!res.dismissedByAction) {
                this.memberService.delete(member).subscribe();
            } else {
                this.dataSource.data = backup;
            }
        });
    }

    private cantDeleteMember(member: Member, n: number) {
        const snackBarRef = this.snackBar.open(`Member '${member.pseudo}' can't be deleted -->
        ${n} ' Open rental(s) item(s)`, 'Undo', { duration: 10000 });
    }

    private create() {
        const member = new Member({});
        const dlg = this.dialog.open(EditMemberComponent, { data: member });
        dlg.beforeClose().subscribe(res => {
            if (res) {
                this.dataSource.data = [...this.dataSource.data, res];
            }
        });
    }

}
