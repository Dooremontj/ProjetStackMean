import { Router, Request, Response, NextFunction } from 'express';
import { Member } from '../models/member';
import { Rental } from '../models/rental';

export class MembersRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/', this.getAll);
        this.router.post('/', this.create);
        this.router.delete('/', this.deleteAll);
        this.router.get('/:id', this.getOne);
        this.router.put('/:id', this.update);
        this.router.delete('/:id', this.deleteOne);
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const members = await Member.find().sort({ pseudo: 'asc' });
            res.json(members);
        } catch (err) {
            res.status(500).send(err);
        }
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

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const updatedMember = await Member.findOneAndUpdate({ pseudo: req.params.id },
                req.body,
                { new: true });  // pour renvoyer le document modifié
            res.json(updatedMember);
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async deleteOne(req: Request, res: Response, next: NextFunction) {
        try {
            const member = await Member.findOneAndRemove({ pseudo: req.params.id });
            // Supprimer les rentals si on supprime un membre
            const rentals = await Rental.find({ 'member': member._id });
            rentals.forEach(function (r) {
                r.remove();
            });
            //////
            if (member != null) {
                res.json(true);
            } else {
                res.status(404).json(false);
            }
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async deleteAll(req: Request, res: Response, next: NextFunction) {
        try {
            const r = await Member.remove({});
            res.json(true);
        } catch (err) {
            res.status(500).send(err);
        }
    }
}
