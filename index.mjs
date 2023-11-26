import "./config.mjs";
import express from 'express'
import path from 'path'
import session from 'express-session'
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import connectSession from 'connect-mongodb-session'




const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




import "./db.mjs";
import mongoose from 'mongoose';

const MongoDBStore = connectSession(session)
const databaseName = 'minesweeperdb'
const mongoSessionUri = process.env.DSN

const store =  new MongoDBStore({
  uri: mongoSessionUri,
  collection: 'sessions', // Collection to store sessions
  // Additional options, if needed
});

const User = mongoose.model('User');
const GameStat = mongoose.model('GameStat');
console.log(process.env.DSN);

if (mongoose.connection.readyState === 1) {
    console.log('Database connection is established');
  } else {
    console.log('Database connection is not established');
  }

app.use(cookieParser(process.env.Key));

app.use(session({
    secret: process.env.Key, // Change this to a secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
      //httpOnly: true,
      sameSite: 'lax', // can be 'strict', 'lax', or 'none'
      // maxAge: 1000 * 60 * 60 * 24 // 24 hours, for example
    },
    store: store
}));

app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(logReq);
app.use(cors({credentials: true,origin:true}))

app.use(bodyParser.json({  extended:false }));





app.use((err, req, res, next) => {
  if(err){
    console.error(err);
    res.status(500).send('Internal Server Error');
  }else{
    next();

  }
});

// configure templating to hbs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

function logReq (req, res, next) {
  let message = "";
  message+= `Method: ${req.method}\n`;
  message+= `Session ID: ${req.session.id}\n`;
  message+= `Session username: ${req.session.username}\n`;
  message+= `Path: ${req.path}\n`;
  message+= `Query: ${JSON.stringify(req.query)}\n`;
  message+= `Body: ${JSON.stringify(req.body)}\n`;
  message+= `URL: ${req.url}`;
  console.log(message);
  next();
};

// body parser (req.body)



app.get('/', (req, res) => {
    //res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    //res.send("Hello")
    const contentType = req.headers['Content-Type'];
    if(contentType != undefined && contentType === 'application/json'){

    }else{
      res.render('minesweeper.hbs', {});
    }
    
})

function getBestTime(list){
  if(list.length == 0){
    return null
  }
  list.sort((a,b) => {
    if(a.timeCompleted == b.timeCompleted){
      return a.id-b.id
    }
    return a.timeCompleted-b.timeCompleted
  })
  return list[0];

}

// function sortTasks(req, l) {
//   if (req.query['sort-by'] && req.query['sort-order']) {
//     const newL = [...l];
//     const crit = req.query['sort-by'];
//     const ord = req.query['sort-order'];
//     newL.sort((a, b)=>{
//       if (ord === 'asc') {
//         switch (crit) {
//           case 'due-date': {
//             const a1 = a['due-date'];
//             const b1 = b['due-date'];
//             if (a1 === b1) { return 0; }
//             return a1 > b1 ? 1 : -1;
//           }
//           case 'priority': {
//             return a[crit] - b[crit];
//           }
//           default: {
//             return 0;
//           }
//         }
//       } else if (ord === 'desc') {
//         switch (crit) {
//           case 'due-date': {
//             const a1 = new Date(a[crit]);
//             const b1 = new Date(b[crit]);
//             if (a1 === b1) { return 0; }
//             return a1 < b1 ? 1 : -1;
//           }
//           case 'priority': {
//             return b[crit] - a[crit];
//           }
//           default: {
//             return 0;
//           }
//         }
//       } else {
//         return [];
//       }
//     });
//     return newL;
//   } else {
//     return l;
//   }
// }

function filterStatsList(req, l){
  if (req.query["userQ"] || req.query["boardSizeQ"]) {
    //console.log("filtering")
    let userQ = req.query['userQ'];
    const username = req.session.username
    if(userQ === 'current') userQ = username ? username : req.session.id.substring(6)

    const boardSizeQ = req.query['boardSizeQ'];
    
    console.log(userQ,boardSizeQ);
    return l.filter((stat)=>{
      return (userQ === '' || stat.username === userQ) &&
      (boardSizeQ === 'any' || stat.boardSize.rows + 'x' + stat.boardSize.columns === boardSizeQ);
    });
  }
  else {return l;}
}



app.post('/', async (req,res) => {
  //const sId = req.sessionID;
  let data = req.body
  const username = req.session.username
  data = {...data, username: username ? username : req.session.id.substring(0,6)}

  let bestTime;
  const gameStat = new GameStat(data)
  let gameStatList
  try {
    await gameStat.save()
    gameStatList = await GameStat.find()
  } catch(err){
    console.error(err)
    console.error("saving failed")
  }
  
  const bestTimeStat = getBestTime(gameStatList)
  if(bestTimeStat === null){
    bestTime = 1e6
  }else{
    bestTime = bestTimeStat.timeCompleted
  }
  console.log(bestTime)
  res.json({ bestTime});
})

let userList = [];

app.get('/leaderboard', async (req, res) => {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    const gameStatsList = await GameStat.find();
    // console.log(gameStatsList);
    let filteredList = filterStatsList(req, gameStatsList)
    res.render('leaderboard.hbs', {'gameStatsList' : filteredList});
    
})





app.post('/leaderboard', async (req, res) => {
    const { username, password } = req.body;
    //frontend: if username exist, get rid of the form
    //save username to session
  // Create a new review document in your MongoDB using Mongoose
    const user = new User({
        username,
        password,
    });
    req.session.username = username
    await user.save();
    res.redirect('/leaderboard');
})

app.get('/tutorial', (req,res) => {
    res.render('tutorials.hbs', {})
})

export default app;

// app.listen(process.env.PORT || 3000);


