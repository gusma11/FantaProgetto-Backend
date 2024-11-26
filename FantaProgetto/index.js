const express = require('express');
const cors = require('cors');
const routes = require('./modules/routes'); // Importa il file delle rotte
const dotenv = require('dotenv');
dotenv.config();

// INIZIALIZZO EXPRESS E ABILITO LE CORS
const app = express();
const mongoose = require('mongoose');
app.use(cors());

const { auth } = require('express-openid-connect');

// CONNETTO AL DATABASE
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

const database = mongoose.connection;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASEURL,
    clientID: process.env.AUTH0_CLIENTID,
    issuerBaseURL: process.env.AUTH0_ISSUERBASEURL
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

database.once('open', async () => {
    const Users = require('./modules/model/userSchema');

    // Route pubblica per la registrazione degli utenti
    app.post('/user-register', async (req, res) => {
        const checkUser = await Users.findOne({ email: req.body.email });
        if (!checkUser) {
            Users.create({ email: req.body.email, name: req.body.name, picture: req.body.picture, team: { drivers: [], teams: [] } });
        }
        res.sendStatus(200);
    });

    // AGGIUNGO GLI ENDPOINT
    app.use('/', routes); // Usa le rotte importate

    // AVVIO L'APP SU PORTA 4000
    app.listen(process.env.PORT, () => {
        console.log(`Il server è avviato su porta ${process.env.PORT}`);
    });
});
