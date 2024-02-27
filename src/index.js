const express = require('express');
//const pug = require('pug');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const db = require('./db/db.js');

db.init_db();

const static_dir = 'public';

const app = express();

const secret = 'A_very_insecure_secret';

let papers = [];


function create_jwt(name, room_id) {
    return jwt.sign({name, room_id}, secret);
}

function authenticateUser(req, res, next) {
    let auth = req.cookies['roomauth'];
    if (!auth) res.sendStatus(401);
    let token = auth.split(' ')[1];

    jwt.verify(token, secret, (err, val) => {
        if (err) res.sendStatus(403);
        req.x_game_info = val;

        next()
    });
}

// Set up Express settings for middleware
app.use(express.static(`${__dirname}/${static_dir}` ));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Set up view template engine
app.set('view engine', 'pug'); 
app.set('views', __dirname + '/views');

const PORT = process.env.PORT || 3000;

app.post('/room', (req, res) => {
    console.log('== room ==');
    const user = req.body.nickname;
    const room = req.body.roomCode;
    const mode = room ? 'JOIN' : 'CREATE';
  
    if (mode === 'CREATE') {
       db.create_room(user)
            .then((roomId) => {
                console.log(`room created: ${roomId}`);
                let token = create_jwt(user, roomId);
                res.cookie('roomauth', token, {httpOnly: true, maxAge: 18000});
                res.render('writing', {name: user, roomCode: roomId.substr(roomId.length-4), papers: ['Hello', 'this', 'is', 'a', 'test']});
            })
            .catch((err) => {console.log(err)});
    }
    else {
        db.join_room(user, room).then((room) => {
            console.log(`room joined: ${room.joincode}`);
            let token = create_jwt(user, room.id);
            res.cookie('roomauth', token, {httpOnly: true, maxAge: 18000});
            res.render('writing', {name: user, roomCode: room.joincode, papers: ['Hello', 'this', 'is', 'a', 'test']});
        });
    }
});

app.get('/paper', authenticateUser, (req, res) => {
    res.render('paper', { papers }); 
});

app.post('/paper', authenticateUser, (req, res) => {
    let content = req.body.msg;
    
    papers.push(content);
    res.render('paper', { papers });
});

app.listen(PORT);
