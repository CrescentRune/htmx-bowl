const express = require('express');
const pug = require('pug');

const static_dir = 'public';

const app = express();

let papers = [];

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
   
    res.render('writing', {name: user, roomCode: room, papers: ['Hello', 'this', 'is', 'a', 'test']});
});

app.get('/paper', (req, res) => {
    res.render('paper', { papers }); 
});

app.post('/paper', (req, res) => {
    let content = req.body.msg;
    
    papers.push(content);
    console.log(papers);
    res.render('paper', { papers });
});

app.listen(PORT);
