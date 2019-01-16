import { Component, OnInit, ViewChild } from '@angular/core';
import { CategoryService, Category } from '../../services/category.service';
import { MatTableDataSource, MatDialog, MatSnackBar, MatSort, MatPaginator } from '@angular/material';
import { NgForm, FormGroup, FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { CastError } from 'mongoose';

@Component({
    selector: 'app-categorylist',
    templateUrl: './category-list.component.html',
    styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {


    displayedColumns: string[] = ['name', 'actions'];
    dataSource: MatTableDataSource<Category>;
    public frm: FormGroup;
    public ctlCategory: FormControl;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private categoryService: CategoryService, private fb: FormBuilder,
        public dialog: MatDialog, public snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        this.configDataSource();
        this.ctlCategory = this.fb.control('', []);
        this.frm = this.fb.group({
            _id: null,
            name: this.ctlCategory
        });
    }

    private configDataSource() {
        this.categoryService.getAll().subscribe(cats => {
            this.dataSource = new MatTableDataSource(cats);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }


    edit(category: Category) {
        this.frm.patchValue(category); // rempli l'input
    }

    private delete(category: Category) {
        const backup = this.dataSource.data; // on garde l'ancienne en cas de undo
        this.dataSource.data = _.filter(this.dataSource.data, m => m._id !== this.frm.value._id);
        const snackBarRef = this.snackBar.open(`Category '${category.name}' will be deleted`, 'Undo', { duration: 10000 });
        snackBarRef.afterDismissed().subscribe(res => {
            if (!res.dismissedByAction) {
                this.categoryService.delete(category).subscribe();
                this.refresh();
            } else {
                this.dataSource.data = backup;
            }
        });
    }

    update() {
        const data = this.frm.value;
        if (data._id === null) {
            this.categoryService.add(data).subscribe(m => { data._id = m._id; this.refresh(); });
        } else {
            this.categoryService.update(data).subscribe(m => this.refresh());
        }
    }
}

