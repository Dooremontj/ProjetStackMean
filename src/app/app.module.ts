import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
import {
    MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule,
    MatTableModule, MatPaginatorModule, MatRadioModule, MatSortModule, MatIconModule,
    MatSlideToggleModule, MatDialogModule, MatSnackBarModule, MatOptionModule,
    MatTabsModule, MatSelectModule, MatNativeDateModule, MatDatepickerModule
} from '@angular/material';
import { AppComponent } from './app.component';
import { MemberService } from './services/member.service';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { UnknownComponent } from './components/unknown/unknown.component';
import { SecuredHttp } from './services/securedhttp.service';
import { AuthGuard, AdminGuard } from './services/auth-guard.service';
import { AuthService } from './services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RestrictedComponent } from './components/restricted/restricted.component';
import { LogoutComponent } from './components/logout/logout.component';
import { EditMemberComponent } from './components/edit-member/edit-member.component';
import { EditBookComponent } from './components/edit-book/edit-book.component';
import { SetFocusDirective } from './directives/setfocus.directive';
import { MemberCommonService } from './services/member-common.service';
import { MemberListComponent } from './components/memberlist/memberlist.component';
import { CategoryListComponent } from './components/categorylist/category-list.component';
import { CategoryService } from './services/category.service';
import { BookListComponent } from './components/booklist/booklist.component';
import { SignupComponent } from './components/signup/signup.component';
import { BookService } from './services/book.service';
import { BookCommonService } from './services/book-common.service';
import { BasketListComponent } from './components/basketlist/basketlist.component';
import { RentalCommonService } from './services/rental-common.service';
import { CurrentRentListComponent } from './components/currentrentlist/current-rent-list.component';
import { SignupService } from './services/signup.service';
import { DetailBookComponent } from './components/detailbook/detailbook.component';
import { AddCategoryComponent } from './components/categoryAddAndRemove/addCategory/add-category.component';
import { RemoveCategoryComponent } from './components/categoryAddAndRemove/removeCategory/remove-category.component';
import { HomeAdminComponent } from './components/home_admin/home-admin.component';
import { DatePipe } from '@angular/common';
import { EditRentComponent } from './components/edit-rent/edit-rent.component';

export function tokenGetter() {
    return sessionStorage.getItem('id_token');
}


@NgModule({
    declarations: [
        AppComponent,
        MemberListComponent,
        CategoryListComponent,
        BookListComponent,
        LoginComponent,
        LogoutComponent,
        HomeComponent,
        UnknownComponent,
        RestrictedComponent,
        EditMemberComponent,
        EditBookComponent,
        EditRentComponent,
        AddCategoryComponent,
        RemoveCategoryComponent,
        DetailBookComponent,
        SignupComponent,
        BasketListComponent,
        CurrentRentListComponent,
        HomeAdminComponent,
        SetFocusDirective,
    ],
    entryComponents: [EditMemberComponent, EditBookComponent, DetailBookComponent, EditRentComponent],
    imports: [
        HttpClientModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule,
        MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule,
        MatSlideToggleModule, MatDialogModule, MatSnackBarModule, MatTabsModule, MatOptionModule, MatDatepickerModule,
        MatSelectModule, MatNativeDateModule, MatRadioModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'login', component: LoginComponent },
            { path: 'signup', component: SignupComponent },
            {
                path: '',
                canActivate: [AuthGuard],
                children: [
                    { path: 'logout', component: LogoutComponent },
                    { path: 'home', component: HomeComponent },
                    { path: 'books', component: BookListComponent },

                    {
                        path: '',
                        canActivate: [AdminGuard],
                        children: [
                            { path: 'members', component: MemberListComponent },
                            { path: 'category', component: CategoryListComponent },
                            { path: 'rentals', component: HomeAdminComponent },

                        ]
                    },
                ]
            },
            { path: 'restricted', component: RestrictedComponent },
            { path: '**', component: UnknownComponent }
        ]),
        JwtModule.forRoot({
            config: {
                tokenGetter: tokenGetter
            }
        })
    ],
    providers: [
        SecuredHttp,
        DatePipe,
        AuthGuard,
        SignupService,
        AdminGuard,
        AuthService,
        MemberService,
        CategoryService,
        BookService,
        SignupService,
        MemberCommonService,
        BookCommonService,
        RentalCommonService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
