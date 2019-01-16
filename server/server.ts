import * as http from 'http';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as path from 'path';
import { Member } from './models/member';
import { MembersRouter } from './routes/members.router';
import { Category } from './models/category';
import { CategoryRouter } from './routes/category.routers';
import { AuthentificationRouter } from './routes/authentication.router';
import { MembersCommonRouter } from './routes/members-common.router';
import { Book } from './models/book';
import { BooksRouter } from './routes/books.router';
import { BooksCommonRouter } from './routes/books-common.router';
import { Rental } from './models/rental';
import { RentalsCommonRouter } from './routes/rental-common.router';
import { SignupRouter } from './routes/signup.router';

const MONGO_URL = 'mongodb://127.0.0.1/msn';

export class Server {
    private express: express.Application;
    private server: http.Server;
    private port: any;

    constructor() {
        this.express = express();
        this.middleware();
        this.mongoose();
        this.routes();
    }

    private middleware(): void {
        const staticRoot = path.resolve(__dirname + '/..');
        this.express.use(express.static(staticRoot));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    // initialise les routes
    private routes() {
        this.express.use('/api/signup', new SignupRouter().router);
        this.express.use('/api/token', new AuthentificationRouter().router);
        this.express.use('api/signup', new SignupRouter().router);
        this.express.use(AuthentificationRouter.checkAuthorization);    // à partir d'ici il faut être authentifié
        this.express.use('/api/members-common', new MembersCommonRouter().router);
        this.express.use('/api/books-common', new BooksCommonRouter().router);
        this.express.use('/api/rental-common', new RentalsCommonRouter().router);
        this.express.use('/api/category', new CategoryRouter().router);
        this.express.use('/api/books', new BooksRouter().router);
        this.express.use(AuthentificationRouter.checkAdmin);            // à partir d'ici il faut être administrateur
        this.express.use('/api/members', new MembersRouter().router);
    }

    // initialise mongoose
    private mongoose() {
        (mongoose as any).Promise = global.Promise;     // see: https://stackoverflow.com/a/38833920
        let trials = 0;
        const connectWithRetry = () => {
            trials++;
            mongoose.connect(MONGO_URL)
                .then(res => {
                    console.log('Connected to MONGODB');
                    this.initData();
                })
                .catch(err => {
                    if (trials < 3) {
                        console.error('Failed to connect to mongo on startup - retrying in 2 sec');
                        setTimeout(connectWithRetry, 2000);
                    } else {
                        console.error('Failed to connect to mongo after 3 trials ... abort!');
                        process.exit(-1);
                    }
                });
        };
        connectWithRetry();
    }

    private initData() {
        const jeremy = new Member({
            pseudo: 'jeremy',
            password: 'jeremy',
            admin: false
        });
        const catInformatique = new Category({ name: 'Informatique' });
        const catRoman = new Category({ name: 'Romanssss' });
        const catNul = new Category({ name: 'Nuls' });

        const book1 = new Book({
            isbn: '999',
            title: 'Ludovic for Dummies',
            author: 'Duchmol', editor: 'EPFC'
        });
        const book2 = new Book({
            isbn: '888',
            title: 'Jeremy for Dummies',
            author: 'Duchmol', editor: 'EPFC'
        });
        const book3 = new Book({
            isbn: '123456',
            title: 'Category for Dummies',
            author: 'Duchmol', editor: 'EPFC'
        });
        book3.addCategories(catInformatique);
        book3.addCategories(catRoman);
        book3.addCategories(catNul);
        book1.addCategories(catInformatique);
        book2.addCategories(catInformatique);
        const rental1 = jeremy.rent([book1, book2]);


        Member.count({}).then(count => {
            if (count === 0) {
                console.log('Initializing data...');
                Member.insertMany([
                    { pseudo: 'test', password: 'test', profile: 'Hi, I\'m test!' },
                    { pseudo: 'ben', password: 'ben', profile: 'Hi, I\'m ben!' },
                    { pseudo: 'bruno', password: 'bruno', profile: 'Hi, I\'m bruno!' },
                    { pseudo: 'boris', password: 'boris', profile: 'Hi, I\'m boris!' },
                    { pseudo: 'alain', password: 'alain', profile: 'Hi, I\'m alain!' }, jeremy
                ]);
            }
        });
        Member.count({ pseudo: 'admin' }).then(count => {
            if (count === 0) {
                console.log('Creating admin account...');
                Member.create({
                    pseudo: 'admin', password: 'admin',
                    profile: 'I\'m the administrator of the site!', admin: true
                });
            }
        });

        Book.count({}).then(count => {
            if (count === 0) {
                console.log('Initializing data...');
                Book.insertMany([
                    { isbn: '123', title: 'Angular for dummies', author: 'Ben', editor: 'EPFC' },
                    { isbn: '234', title: 'TS for dummies', author: 'Alain', editor: 'EPFC' },
                    { isbn: '345', title: 'JS for dummies', author: 'Bruno', editor: 'EPFC' },
                    { isbn: '456', title: 'Programming for Jeremy', author: 'Benoit', editor: 'EPFC' },
                    { isbn: '567', title: 'TFE', author: 'Joe', editor: 'EPFC' }, book1, book2, book3
                ]);
            }
        });

        Category.count({}).then(count => {
            if (count === 0) {
                console.log('Initializing data...');
                Category.insertMany([
                    { name: 'Roman' },
                    { name: 'Bande dessinée' },
                    { name: 'enfant' },
                    { name: 'pour les nuls' }, catInformatique, catNul, catRoman
                ]);
            }
        });

        Rental.count({}).then(count => {
            if (count === 0) {
                console.log('Initializing rent ...');
                Rental.insertMany([rental1]);
            }
        });
        // this.createData();
    }

    // démarrage du serveur express
    public start(): void {
        this.port = process.env.PORT || 3000;
        this.express.set('port', this.port);
        this.server = http.createServer(this.express);
        this.server.listen(this.port, () => console.log(`Node/Express server running on localhost:${this.port}`));
    }

    public async createData() {
        try {
            const admin2 = new Member({
                pseudo: 'admin2',
                password: 'admin2',
                admin: true
            });
            const jeremy = new Member({
                pseudo: 'jeremy',
                password: 'jeremy',
                admin: false
            });
            const ludovic = new Member({
                pseudo: 'ludovic',
                password: 'ludovic',
                admin: true
            });
            await Member.insertMany([admin2, jeremy, ludovic]);

            const catInformatique = new Category({ name: 'Informatique' });
            const catScienceFiction = new Category({ name: 'Science Fiction' });
            const catRoman = new Category({ name: 'Roman' });
            const catLitterature = new Category({ name: 'Littérature' });
            const catEssai = new Category({ name: 'Essai' });

            const book1 = new Book({
                isbn: '678',
                title: 'Java for Dummies',
                author: 'Duchmol', editor: 'EPFC'
            });
            const book2 = new Book({
                isbn: '789',
                title: 'Le Seigneur des Anneaux',
                author: 'Tolkien',
                editor: 'Bourgeois'
            });
            const book3 = new Book({
                isbn: '8910',
                title: 'Les misérables',
                author: 'Victor Hugo',
                editor: 'XO'
            });

            book1.addCategories(catInformatique);
            book2.addCategories(catRoman, catScienceFiction);
            book3.addCategories(catRoman, catLitterature);

            await Book.insertMany([book1, book2, book3]);
            await Category.insertMany([
                catEssai,
                catInformatique,
                catLitterature,
                catRoman,
                catScienceFiction
            ]);

            const rental1 = jeremy.rent([book1, book3]);
            const rental2 = jeremy.rent([book2]);
            const rental3 = ludovic.rent([book1, book2, book3]);
            await Rental.insertMany([rental1, rental2, rental3]);
            await jeremy.save();
            await ludovic.save();

            rental1.return([book3]);
            rental3.return([book1, book2]);
            await rental1.save();
            await rental3.save();
        } catch (err) {
            return `ERROR: ${err}`;
        }
        finally {
            await mongoose.disconnect();
        }
    }
}
