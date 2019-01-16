import { Router, Request, Response, NextFunction } from 'express';
import { Member } from '../models/member';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';


export class SignupRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.router.post('/', this.create);

        this.router.get('/:id', this.getOne);
    }

    public async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const member = await Member.find({ pseudo: req.params.id });
            res.json(member);
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        // _id vient avec la valeur nulle d'angular (via reactive forms) => on doit l'enlever pour qu'il reçoive une valeur
        delete req.body._id;
        try {
            const member = new Member(req.body);
            const newMember = await member.save();
            res.json(newMember);
        } catch (err) {
            res.status(500).send(err);
        }
    }


}
