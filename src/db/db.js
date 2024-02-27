const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('src/db/bowl.db');
const {
  randomBytes,
} = require('node:crypto');

const notStarted = 1;
const locked = 2;
const started = 3;
const playing = 4;
const ended = 5;


const generateRoomsTable = `
    CREATE TABLE IF NOT EXISTS room (
        id VARCHAR(16),
        joincode VARCHAR(4),
        started DATETIME,
        status INTEGER,
        owner TEXT,
        lastupdated DATETIME,
        users INTEGER,
        PRIMARY KEY('id')
    );
`;

//const createOpenRoomsView = `
//    CREATE VIEW IF NOT EXISTS open_rooms AS 
//    SELECT id, substr(id, -4) AS join_code FROM room WHERE status='OPEN';
//`

const generatePaperTable = `
    CREATE TABLE IF NOT EXISTS paper (
        room_id VARCHAR(16),
        submitter TEXT,
        body TEXT
    );
`

const createUsersTable = `
    CREATE TABLE IF NOT EXISTS user (
        room_id VARCHAR(16),
        user TEXT
    )
`

const createRoomPaperIndex = `
    CREATE INDEX IF NOT EXISTS room_paper ON paper (room_id);
`

const createJoinIndex = `
    CREATE INDEX IF NOT EXISTS room_join ON room (joincode);
`

const createRoomStmt = `INSERT INTO room (id, joincode, owner, started, status, lastupdated) VALUES (?, ?, ?, datetime('now'), 1, datetime('now'))`

function init_db() {
    db.run(generateRoomsTable);
    db.run(generatePaperTable);
    db.run(createUsersTable);
 //   db.run(createOpenRoomsView);
    db.run(createJoinIndex);
    db.run(createRoomPaperIndex);
}

function create_room(name) {
    let room_id = generate_secret_stub();
    let join_code = room_id.substr(room_id.length - 4);
    
    return new Promise((resolve, reject) => {
        db.run(createRoomStmt, room_id, join_code, name, (err) => {
            if (err) reject(err);
            resolve(room_id);
        });
    });
}

function generate_secret_stub() {
    return randomBytes(16).toString('hex');
}


function get_room_by_code(roomCode) {
    return new Promise(function (resolve, reject) {
        db.get("SELECT id, joincode FROM room WHERE joincode = ?", roomCode, function (err, res) {
            console.log(err, res);
            err ? reject(err) : resolve(res);   
        });
    })
}

function insert_user(room_info, name) {
    if (!room_info) {
        throw new Error('room_info must be valid!');
    }
    return new Promise(function (resolve, reject) {
        db.run('INSERT INTO users (room_id, user) VALUES (?, ?)', room_info.id, name, (err, res) => {
            err ? reject(err) : resolve(room_info.id);
        });
    });
}


function join_room(name, roomCode) {

    return get_room_by_code(roomCode)
        .then((res) => {
            //insert_user(res, name);
            return res;   
        });
}



module.exports = { create_room, join_room, init_db }

