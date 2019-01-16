import * as mongoose from 'mongoose';
import { Rental, IRental } from './rental';
import { Book } from './book';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

// ==============
// === Member ===
// =============

export interface IMember extends mongoose.Document {
    pseudo: string;
    password: string;
    profile: string;
    birthdate: Date;
    admin: boolean;
    picturePath: string;
    phones: { type: string, number: string }[];
    rentals: mongoose.Types.Array<IRental>;
}

const memberSchema = new Schema({
    pseudo: { type: String, required: true, unique: true },
    password: { type: String, default: '' },
    profile: { type: String, default: '' },
    birthdate: { type: Date },
    admin: { type: Boolean, default: false },
    picturePath: { type: String, default: '' },
    phones: [{ type: { type: String, default: '' }, number: { type: String, default: '' } }],
    rentals: [{ type: ObjectId, ref: 'Rental' }]
});

const MemberBase = mongoose.model<IMember>('Member', memberSchema);

export class Member extends MemberBase {
    rent(books: Book[] = []): Rental {
        const rental = new Rental({ member: this, orderDate: new Date().toLocaleString() });
        this.rentals.push(rental);
        books.forEach(b => rental.items.push({ book: b, returnDate: null }));
        return rental;
    }
}
