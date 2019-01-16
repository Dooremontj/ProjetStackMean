import * as mongoose from 'mongoose';
import { Book } from './book';
import { IBook } from './book';


const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export interface ICategory extends mongoose.Document {
    name: string;
    books: mongoose.Types.Array<IBook>;
}

const categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    books: [{ type: ObjectId, ref: 'Book' }],
});

const CategoryBase = mongoose.model<ICategory>('Category', categorySchema);

export class Category extends CategoryBase {
    public addBooks(...args: Book[]): void {
        for (const b of args) {
            if (!this.books.includes(b)) {
                this.books.push(b);
            }
            if (!b.categories.includes(this)) {
                b.categories.push(this);
            }
        }
    }
}
