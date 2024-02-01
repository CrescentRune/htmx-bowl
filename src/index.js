const express = require('express');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;


const htmxRes = ''

app.get('/', (req, res) => {
    res.send("Hello world");
});

app.get('/paper', (req, res) => {

});

app.post('/paper', (req, res) => {

});

app.listen(PORT);