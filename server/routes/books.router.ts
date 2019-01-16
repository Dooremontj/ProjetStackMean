import { Router, Request, Response, NextFunction } from 'express';
import { Book } from '../models/book';
import { Category, ICategory } from '../models/category';
import { Rental } from '../models/rental';
import { Member } from '../models/member';

export class BooksRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/', this.getAll);
        this.router.get('/:isbn', this.getOne);
        this.router.get('/exp/:expression', this.getByExpression);
        this.router.post('/', this.create);
        this.router.post('/removeCat', this.removeCat);
        this.router.delete('/', this.deleteAll);
        this.router.put('/:id', this.update);
        this.router.delete('/:id', this.deleteOne);
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const books = await Book.find().sort({ title: 'asc' });
            res.json(books);
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const book = await Book.find({ isbn: req.params.isbn });
            res.json(book);
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async getByExpression(req: Request, res: Response, next: NextFunction) {
        try {
            const book = await Book.find({
                '$or': [
                    { author: { $regex: req.params.expression, $options: 'i' } },
                    { isbn: { $regex: req.params.expression, $options: 'i' } },
                    { title: { $regex: req.params.expression, $options: 'i' } },
                    { editor: { $regex: req.params.expression, $options: 'i' } }
                ]
            }).sort({ title: 'asc' });
            res.json(book);
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const book = new Book(req.body);
            const newBook = await book.save();
            for (const cat of newBook.categories) {
                await Category.findByIdAndUpdate(cat, { $push: { books: newBook._id } });
            }
            res.json(newBook);
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const updatedBook = await Book.findOneAndUpdate({ isbn: req.params.id },
                req.body,
                { new: true });
            for (const cat of updatedBook.categories) {
                await Category.findByIdAndUpdate(cat, { $push: { books: updatedBook._id } });
            }
            res.json(updatedBook);
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async removeCat(req: Request, res: Response, next: NextFunction) {
        try {
            const catToDelete: Category = req.body.catToDelete;
            const updatedBook = await Book.findOne({ isbn: req.body.isbn });
            await Category.updateOne({ _id: catToDelete._id }, { $pull: { books: updatedBook._id } });
            await Book.updateOne(
                { isbn: req.body.isbn },
                { $pull: { categories: catToDelete._id } }
            );
            res.json(true);
        } catch (err) {
            res.status(500).send(err);
        }
    }

    public async deleteOne(req: Request, res: Response, next: NextFunction) {
        try {
            //


            ///////////////////////////////// Supprime le livre + les anciens rentals qui sont en lien avec
            ////////////////////////////////// (soit retirer l'item du rental soit supprimer le rental)
            ////////////////////////////////// Pas sur que ça fonctionne

            const bookDeleted = await Book.findOneAndRemove({ isbn: req.params.id });
            const itemsList = await Rental.aggregate([
                { $unwind: '$items' },
                { $match: { 'items.book': bookDeleted._id } },
                {
                    $project: {
                        _id: '$items._id',
                    }
                }
            ]);
            const rent = await Rental.find({
                     'items._id': { $in: [...itemsList] } },
            );
                console.log(rent);
            for (const r of rent) {
                console.log(r.items.length);
                if (r.items.length === 1 ) {
                    const rentalsToDelete = await Rental.findOneAndRemove({ _id: r._id });
                    const member = await Member.findOne({ 'rentals' : rentalsToDelete._id });
                    console.log(member);
                    await Member.updateOne(
                        { _id: member._id },
                        { $pull: { rentals:  rentalsToDelete._id  } });
                }
            }

            await Rental.updateMany(
                { 'items._id': { $in: [...itemsList] } },
                { $pull: { items : { book:  bookDeleted._id } } }
            );

            await Category.updateMany(
                { _id: { $in: bookDeleted.categories } },
                { $pull: { books: bookDeleted._id } }
            );


            // supprime le livre + supprimer des categories le livre
            // ça fonctionne sur et certain ... function du dessus ... des doutes

            /////////////////////////////
            /*
            const book = await Book.findOneAndRemove({ isbn: req.params.id });
            res = await Category.updateMany(
                { _id: { $in: book.categories } },
                { $pull: { books: book._id } }
            );
            */
            /////////////////////////////////////////////
            if (bookDeleted != null) {
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
            const r = await Book.remove({});
            res.json(true);
        } catch (err) {
            res.status(500).send(err);
        }
    }

}
