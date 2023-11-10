import mongoose from 'mongoose';
mongoose.connect(process.env.DSN);

//console.log(process.env.Key)

//my schema goes here

const UserSchema = new mongoose.Schema(
    {username: String,
    password: String,
    gameList: Array,
});

const GameStatsSchema = new mongoose.Schema(
    {
        gameId: Number,
        difficulty: String,
        boardSize: Object,
        clicks: Number,
        timeCompleted: String// timestamp
    }
)

mongoose.model('User', UserSchema);
mongoose.model('GameStat', GameStatsSchema);