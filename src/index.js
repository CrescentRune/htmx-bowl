const express = require('express');
const pug = require('pug');
const jwt = require('jsonwebtoken');

import * as db from './db/db';

const static_dir = 'public';

const app = express();

const secret = 'A_very_insecure_secret';

let papers = [];


function create_jwt(name, room_id) {
    return jwt.sign({name, room_id}, secret);
}

function authenticateUser(req, res, next) {
    let auth = req.headers['authorization'];
    let token = auth.split(' ')[1];

    jwt.verify(token, secret, (err, val) => {
        if (err) res.sendStatus(403);
        req.x_game_info = val;

        next()
    });
}

function validate_jwt(token) {
    if (!token) return null;
    let result = jwt.verify(token, secret);
    return result;
}

// Set up Express settings for middleware
app.use(express.static(`${__dirname}/${static_dir}` ));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up view template engine
app.set('view engine', 'pug'); 
app.set('views', __dirname + '/views');

const PORT = process.env.PORT || 3000;

app.post('/room', (req, res) => {
    const user = req.body.nickname;
    const room = req.body.roomCode;
    const mode = room ? 'JOIN' : 'CREATE';
  
    if (mode === 'CREATE') {
       db.create_room(user)
            .then((res) => {
                let token = create_jwt(user, res);
                res.setHeader('SetCookie', `Authorization: Bea`);
            })
            .catch((err) => {});
    }
    else {
        db.join_room(user, room);
    }
    res.render('writing', {name: user, roomCode: room, papers: ['Hello', 'this', 'is', 'a', 'test']});
});

app.get('/paper', authenticateUser, (req, res) => {
    res.render('paper', { papers }); 
});

app.post('/paper', authenticateUser, (req, res) => {
    let content = req.body.msg;
    
    papers.push(content);
    console.log(papers);
    res.render('paper', { papers });
});

app.listen(PORT);
