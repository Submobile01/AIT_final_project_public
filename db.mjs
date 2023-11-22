import mongoose from 'mongoose';
import path from 'path'
mongoose.connect(path.join(process.env.DSN, process.env.DSNQuery));

//console.log(process.env.Key)

//my schema goes here 

const UserSchema = new mongoose.Schema(
    {username: String,
    password: String,
});

const GameStatsSchema = new mongoose.Schema(
    {   username: String,
        difficulty: String,
        boardSize: Object,
        clicks: Number,
        timeCompleted: String// timestamp
    }
)

mongoose.model('User', UserSchema);
mongoose.model('GameStat', GameStatsSchema);