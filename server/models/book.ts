import * as mongoose from 'mongoose';
import { IRental } from './rental';
import { Rental } from './rental';
import { Category } from './category';
import { ICategory } from './category';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export interface IBook extends mongoose.Document {
    isbn: string;
    author: string;
    title: string;
    editor: string;
    picturePath: string;
    categories: mongoose.Types.Array<ICategory>;
}




const bookSchema = new Schema({
    isbn: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    title: { type: String, required: true },
    editor: { type: String, required: true },
    picturePath: { type: String },
    categories: [{ type: ObjectId, ref: 'Category' }],
});

const BookBase = mongoose.model<IBook>('Book', bookSchema);

export class Book extends BookBase {
    public addCategories(...args: Category[]): void {
        for (const b of args) {
            if (!this.categories.includes(b)) {
                this.categories.push(b);
            }
            if (!b.books.includes(this)) {
                b.books.push(this);
            }
        }
    }
}


