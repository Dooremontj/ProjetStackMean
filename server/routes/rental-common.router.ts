import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import { Rental } from '../models/rental';
import { AuthentificationRouter } from './authentication.router';
import { pipe } from 'rxjs';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as moment from 'moment';
import { Member } from '../models/member';
import { Book, IBook } from '../models/book';
import { ObjectID } from 'mongodb';


export class RentalsCommonRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/', this.getAll);
        this.router.get('/forMember', this.getAllWithoutReturnDate);
        this.router.post('/rent', this.add);
        this.router.get('/numberOfRent/:id', this.getCount);
        this.router.put('/:id', this.update);
        this.router.delete('/:id', this.deleteOne);

    }

    public async getAllWithoutReturnDate(req: Request, res: Response, next: NextFunction) {
        try {
            const rentals = await Rental.aggregate([
                { $unwind: '$items' },
                { $match: { 'items.returnDate': null } },
            ]);
            await Rental.populate(rentals, { path: 'member items.book' });
            res.json(rentals);
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const rentals = await Rental.aggregate([
                // permet d'obtenir un document par item
                { $unwind: '$items' },
                {
                    // jointure sur les membres pour avoir les données du membre plutôt que son id
                    $lookup: {
                        from: 'members',        // jointure sur la collection 'members'
                        localField: 'member',   // jointure se fait entre rentals.member ...
                        foreignField: '_id',    // ... et books._id
                        as: 'member'            // alias pour le résultat
                    }
                },
                {
                    // jointure sur les livres
                    $lookup: {
                        from: 'books',
                        localField: 'items.book',
                        foreignField: '_id',
                        as: 'book'
                    }
                },
                // par défaut les jointures retournent un array, même si une seul élément. Grâce au
                // $unwind on transforme cet array d'un seul élément en l'élément lui-même.
                { $unwind: '$member' },
                { $unwind: '$book' },
                {
                    // La projection permet de formater les objets retournés par le query.
                    // A gauche de chaque attribut on met le nom qu'on veut obtenir et à droite
                    // on met soit true pour dire qu'on prend la donnée qui a le même nom, soit
                    // on met une expression qui sera évaluée (ex: $items._id) pour avoir l'id
                    // du rental item.
                    $project: {
                        _id: '$items._id',
                        orderDate: true,
                        member: true,
                        returnDate: '$items.returnDate',
                        'book': '$book'
                    }
                }
            ]);
            res.json(rentals);
        } catch (err) {
            res.status(500).send(err);
        }
    }



    public async getCount(req: Request, res: Response, next: NextFunction) {
        try {
            const rentals = await Rental.aggregate([
                { $unwind: '$items' },
                // $match permet de filtrer le résultat précédent pour ne garder que les items
                // ayant une date de retour nule.
                { $match: { 'items.returnDate': null } },
                {
                    $lookup: {
                        from: 'members',
                        localField: 'member',
                        foreignField: '_id',
                        as: 'member'
                    }
                },
                // On doit mettre ce $match ci ici car il dépend du résultat du $lookup
                { $match: { 'member.pseudo': req.params.id } },
                {
                    $lookup: {
                        from: 'books',
                        localField: 'items.book',
                        foreignField: '_id',
                        as: 'book'
                    }
                },
                { $unwind: '$member' },
                { $unwind: '$book' },
                {
                    $project: {
                        _id: '$items._id',
                        orderDate: true,
                        member: true,
                        returnDate: '$items.returnDate',
                        'book': '$book'
                    }
                }
            ]);
            res.json(rentals);
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async add(req: Request, res: Response, next: NextFunction) {
        try {
            // const currentUser = req['decoded'].pseudo;
            const test = await Member.findOne({ pseudo: req.body.pseudo });
            // remplacer ligne du dessous par ça en principe
            // const rental = new Rental ({member: test, orderDate: moment(new Date().toLocaleString()).format('DD-MM-YYYY HH:mm:ss')});

            const rental = new Rental({ member: test, orderDate: new Date().toLocaleString() });
            // test.rentals.push(rental);
            await Promise.all([
                Member.findByIdAndUpdate(
                    { _id : test._id },
                    {$push: { rentals : rental} })
            ]);
            const books: IBook[] = req.body.basket;
            books.forEach(b => rental.items.push({ book: b, returnDate: null }));
            const newRental = rental.save();
            res.json(true);
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async deleteOne(req: Request, res: Response, next: NextFunction) {
        try {
            const rent = await Rental.findOne({ 'items._id': req.params.id });
            if (rent.items.length === 1) {
                const rentalsToDelete = await Rental.findOneAndRemove({ _id: rent._id });
                const member = await Member.findOne({ 'rentals': rent._id });
                await Member.updateOne(
                    { _id : member._id },
                    { $pull: { rentals: { _id: rent._id } } });
            } else {
                await Rental.updateOne(
                    { 'items._id': req.params.id },
                    { $pull: { items: { _id: req.params.id } } }
                );
            }
            res.json(true);
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const rent = await Rental.updateOne(
                { 'items._id': req.params.id },
                { $set: { 'items.$.returnDate': req.body.returnDate } }
            );
            res.json(true);
        } catch (err) {
            res.status(500).send(err);
        }
    }

}
