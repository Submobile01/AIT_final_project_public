import "./config.mjs";
import express from 'express'
import path from 'path'
import session from 'express-session'
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import connectSession from 'connect-mongodb-session'

/** Utility functions starts*/

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

function filterStatsListByQuery(req, l){
  if (req.query["userQ"] || req.query["boardSizeQ"]) {
    //console.log("filtering")
    let userQ = req.query['userQ'];
    const username = req.session.username
    if(userQ === 'mine') userQ = username ? username : req.session.id.substring(0,6)
    const boardSizeQ = req.query['boardSizeQ'];

    return filterStatsList(userQ, boardSizeQ, l);
  }
  else {return l;}
}

function filterStatsList(userQ, boardSizeQ, l){
  return l.filter((stat)=>{
    return (userQ === '' || userQ === 'all' || stat.username === userQ) &&
    (boardSizeQ === 'any' || stat.boardSize.rows + 'x' + stat.boardSize.columns === boardSizeQ);
  });
}


function sortStats(req, l) {
  if (req.query['sort-by'] && req.query['sort-order']) {
    const newL = [...l];
    const crit = req.query['sort-by'];
    const ord = req.query['sort-order'];
    console.log(crit, ord)
    console.log(newL[0])
    newL.sort((a, b)=>{
      if (ord === 'asc') {
        switch (crit) {
          case 'timeCompleted': {
            const a1 = a['timeCompleted'];
            const b1 = b['timeCompleted'];
            if (a1 === b1) { return 0; }
            return a1 > b1 ? 1 : -1;
          }
          case 'difficulty': {
            return a['difficulty'] - b['difficulty']
          }
          default: {
            return 0;
          }
        }
      } else if (ord === 'desc') {
        switch (crit) {
          case 'timeCompleted': {
            const a1 = a['timeCompleted'];
            const b1 = b['timeCompleted'];
            if (a1 === b1) { return 0; }
            return a1 < b1 ? 1 : -1;
          }
          case 'difficulty': {
            return b['difficulty'] - a['difficulty']
          }
        }
      } else {
        return [];
      }
    });
    return newL;
  } else {
    return l;
  }
}

async function checkLogin(username, password){
  const user = await User.findOne({username})
  console.log(user)
  if(user){
    if(password.trim() === user.password){
      return 'success'
    }
    return 'wrong password'
  }
  return 'user not found'
}
/** Utility functions ends */



const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//import db schemas
import "./db.mjs";
import mongoose from 'mongoose';
//console.log(process.env.DSN);

//setup mongodb session store
const MongoDBStore = connectSession(session)
const mongoSessionUri = process.env.DSN

const store =  new MongoDBStore({
  uri: mongoSessionUri,
  collection: 'sessions', // Collection to store sessions
  // Additional options, if needed
});

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

//instantiate models
const User = mongoose.model('User');
const GameStat = mongoose.model('GameStat');


if (mongoose.connection.readyState === 1) {
    console.log('Database connection is established');
} else {
    console.log('Database connection is not established');
}



app.use(express.static(path.join(__dirname, 'public')));//serves static files
app.use(express.urlencoded({ extended: true }));//parse request body/queries
app.use(cors({credentials: true,origin:true}))
app.use(express.json({  extended:true }));//parses json
app.use(logReq);//logs requests on server

//status code
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

//handles root directory of Minesweeper

app.get('/', (req, res) => {
    //res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    //res.send("Hello")
    const contentType = req.headers['Content-Type'];
    if(contentType != undefined && contentType === 'application/json'){
      //if get request is a fetch
    }else{
      const username = req.session.username ? req.session.username : req.session.id.substring(0,6)
      res.render('minesweeper.hbs', {subtitle: 'Main Game',
                                    css: 'game.css',
                                    username: username, 
                                    loginfailed: (req.query.loginfailed === 'true'),
                                    registering: (req.query.registering === 'true')
                                    });
    } 
})

app.post('/', async (req,res) => {
  //const sId = req.sessionID;
  const contentType = req.headers['content-type'];
  console.log('contentType:',contentType);
  console.log('headers:', req.headers)
  if(contentType != undefined && contentType === 'application/json'){
    //if get request is a fetch
    console.log("receiving json")
    let data = req.body
    let username = req.session.username
    username = username ? username : req.session.id.substring(0,6)
    data = {...data, username}
    const gameStat = new GameStat(data)
    let gameStatListGlobal, gameStatListPersonal
    try {
      await gameStat.save()
      gameStatListGlobal = await GameStat.find()
      gameStatListPersonal = await GameStat.find({username})
    } catch(err){
      console.error(err)
      console.error("saving failed")
    }
    
    console.log(gameStatListPersonal)
    const bestPersonalTimeStat = getBestTime(gameStatListPersonal)
    const bestGlobalTimeStat = getBestTime(gameStatListGlobal)
    const bestPersonalTime = bestPersonalTimeStat ? bestPersonalTimeStat.timeCompleted : 1e6
    const bestGlobalTime = bestGlobalTimeStat ? bestGlobalTimeStat.timeCompleted : 1e6

    
    console.log({ bestPersonalTime, bestGlobalTime})
    res.json({ bestPersonalTime, bestGlobalTime});
  }else{
    //if a normal post request

    const { username, password } = req.body;
    
    const msg = await checkLogin(username, password)
    console.log(msg)
    //Create a new review document in your MongoDB using Mongoose
    if(msg === 'user not found'){
      console.log('creating new user')
      const user = new User({
          username,
          password,
      });
      await user.save();
      req.session.username = username
      res.redirect('/?loginfailed=false&registering=true');
    }else if(msg === 'wrong password'){
      res.redirect('/?loginfailed=true&registering=false')
    }else if(msg === 'success'){
      req.session.username = username
      res.redirect('/?loginfailed=false&registering=false');
    }
    //save username to session
    
    
    
  }
    
})


//handles leaderboard requests

app.get('/leaderboard', async (req, res) => {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    const gameStatsList = await GameStat.find();
    // console.log(gameStatsList);
    let filteredList = filterStatsListByQuery(req, gameStatsList)
    let sortedFilteredList = sortStats(req, filteredList)
    res.render('leaderboard.hbs', {'gameStatsList' : sortedFilteredList, css: 'leaderboard.css',subtitle: 'Game Statistics'});
    
})

app.post('/leaderboard', async (req, res) => {
    
    res.redirect('/leaderboard');
})

// handle tutorial requests

app.get('/tutorial', (req,res) => {
    res.render('tutorials.hbs', {subtitle: 'Tutorial',css: 'tutorial.css'})
})

app.get('/rules', (req, res) => {
    res.render('rules.hbs', {subtitle: 'Rules'})
})

// handle 


//export default app;



app.listen(process.env.PORT || 3000);


