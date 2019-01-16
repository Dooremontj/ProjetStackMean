import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MemberCommonService } from '../../services/member-common.service';
import { Member, MemberService } from '../../services/member.service';
import { map, flatMap } from 'rxjs/operators';

@Component({
    templateUrl: 'home.component.html'
})
export class HomeComponent {
    public memberCount: number | '?' = '?';
    public current: Member;
    private updateCounter = new Date().getTime();

    constructor(public authService: AuthService,
        public memberCommonService: MemberCommonService,
        public memberService: MemberService) {
        this.memberCommonService.getCount().subscribe(c => this.memberCount = c);
        this.memberCommonService.getOne(authService.currentUser).subscribe(m => this.current = m);
    }

    fileChange(event) {
        const fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            const file: File = fileList[0];
            this.memberCommonService.uploadPicture(this.current.pseudo, file).pipe(
                flatMap(path => this.memberCommonService.confirmPicture(this.current.pseudo, path))
            ).subscribe(path => {
                this.updateCounter++;
                this.current.picturePath = path;
                this.memberCommonService.update_picture_path(this.current.pseudo, path).subscribe();
            });
        }
    }

    get picturePath(): string {
        // Le compteur updateCounter sert à générer un URL différent quand on change d'image
        // car sinon l'image ne se rafraîchit pas parce que l'url ne change pas.
        return this.current && this.current.picturePath !== '' ?
            (this.current.picturePath + '?' + this.updateCounter) : 'uploads/unknown-user.jpg';
    }
}
