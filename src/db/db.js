const sqlite3 = require('sqlite3');
const db = new sqlite3('src/db/bowl.db');

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

const createOpenRoomsView = `
    CREATE VIEW IF NOT EXISTS open_rooms AS 
    SELECT id, substr(id, -4) AS join_code FROM room WHERE status='OPEN';
`

const generatePaperTable = `
    CREATE TABLE IF NOT EXISTS paper (
        room_id VARCHAR(16) FOREIGN KEY REFERENCES room,
        submitter TEXT,
        body TEXT,
    );
`

const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        room_id VARCHAR(16) FOREIGN KEY REFERENCES room,
        user TEXT UNIQUE,
    )
`

const createRoomPaperIndex = `
    CREATE INDEX IF NOT EXISTS room_paper ON paper (room_id);
`

const createRoomStmt = `INSERT INTO room (id, joincode owner, started, status, lastupdated) VALUES (?, ?, datetime('now'), 1, datetime('now'))`

function init_db() {
    db.exec(
        generateRoomsTable,
        generatePaperTable,
        createUsersTable,
        createOpenRoomsView,
        createRoomPaperIndex,
    );
}

function create_room(name) {
    let room_id = generate_secret_stub();
    let join_code = room_id.substr(room_id.length - 4);
    
    db.exec(createRoomStmt, room_id, join_code, name);
}

function generate_secret_stub() {
    return crypto.randomBytes(16).toString('hex');
}


function get_room_by_code(roomCode) {
    return new Promise(function (resolve, reject) {
        db.exec('SELECT * FROM rooms WHERE joincode = ?', roomCode, function (err, res) {
            err ? reject(err) : resolve(res);   
        });
    })
}

function insert_user(room_info, name) {
    if (!room_info) {
        throw new Error('room_info must be valid!');
    }
    return new Promise(function (resolve, reject) {
        db.exec('INSERT INTO users (room_id, name) VALUES (?, ?)', (err, res) => {
            err ? reject(err) : resolve(room_info.room_id);
        });
    });
}


function user_joins_room(name, roomCode) {


    return get_room_by_code(roomCode)
        .then(
            insert_user        
        )

}


module.exports = { create_room, userValidator, user_joins_room, }

