import "./config.mjs";
import express from 'express'
import path from 'path'
import session from 'express-session'
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser'


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



import "./db.mjs";
import mongoose from 'mongoose';

const User = mongoose.model('User');
const GameStat = mongoose.model('GameStat');
console.log(process.env.DSN);

if (mongoose.connection.readyState === 1) {
    console.log('Database connection is established');
  } else {
    console.log('Database connection is not established');
  }

app.use(cookieParser('your-secret-key'));

app.use(session({
    secret: 'your-secret-key', // Change this to a secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
      //httpOnly: true,
      sameSite: 'none', // can be 'strict', 'lax', or 'none'
      maxAge: 1000 * 60 * 60 * 24 // 24 hours, for example
  }
}));

app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: false }));
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
  message+= `Session ID: ${req.sessionID}\n`;
  message+= `Path: ${req.path}\n`;
  message+= `Query: ${JSON.stringify(req.query)}\n`;
  message+= `Body: ${JSON.stringify(req.body)}\n`;
  message+= `URL: ${req.url}`;
  console.log(message);
  next();
};

// body parser (req.body)



app.get('/', (req, res) => {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
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

// app.post('/', (req,res) => {
//   //res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
//   const body = req.body


//   res.json({message: data+"message"});
// })

app.post('/', async (req,res) => {
  //const sId = req.sessionID;
  let data = req.body
  const username = req.session.username
  data = {...data, username: username ? username : req.sessionID.substring(0,6)}

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
    console.log(gameStatsList);
    res.render('file_test.hbs', {gameStatsList});
    
})





app.post('/leaderboard', async (req, res) => {
    const { username, password } = req.body;
    //frontend: if username exist, get rid of the form
    //save username to session
  // Create a new review document in your MongoDB using Mongoose
    const user = new User({
        username,
        password,
        gameList: []
    });
    await user.save();
    res.redirect('/leaderboard');
})

export default app;

// app.listen(process.env.PORT || 3000);

