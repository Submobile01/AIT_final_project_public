import "./config.mjs";
import express from 'express'
import path from 'path'
import session from 'express-session'
import { fileURLToPath } from 'url';


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(process.env.DSN);


//import "./db.mjs";
import mongoose from 'mongoose';

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'your-secret-key', // Change this to a secret key
    resave: false,
    saveUninitialized: true,
}));

// configure templating to hbs
app.set('view engine', 'hbs');

const logReq = (req, res, next) => {
    let message = "";
    message+= `Method: ${req.method}\n`;
    message+= `Path: ${req.path}\n`;
    message+= `Query: ${JSON.stringify(req.query)}\n`;
    message+= `Body: ${JSON.stringify(req.body)}`;
    console.log(message);
    next();
  };

// body parser (req.body)
app.use(express.urlencoded({ extended: false }));
app.use(logReq);


app.get('/', (req, res) => {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.render('main.hbs', {});
})

export default app;

// app.listen(process.env.PORT || 3000);

