const sqlite3 = require('sqlite3');
const db = new sqlite3('src/db/bowl.db');

const generateRoomsTable = `
    CREATE TABLE IF NOT EXISTS room (
        id VARCHAR(16),
        started DATETIME,
        status VARCHAR(3),
        owner text,
        lastupdated DATETIME,
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

const createSecretsTable = `
    CREATE TABLE IF NOT EXISTS secrets (
        room_id VARCHAR(16) FOREIGN KEY REFERENCES room,
        user TEXT,
        secret TEXT,
        expiration DATETIME,
    )
`

const createRoomPaperIndex = `
    CREATE INDEX IF NOT EXISTS room_paper ON paper (room_id);
`

function init_db() {
    db.exec(
        generateRoomsTable,
        generatePaperTable,
        createSecretsTable,
        createOpenRoomsView,
        createRoomPaperIndex,
    );
}

function create_room() {
    
}

function generate_secret_stub() {
    return 'aaaaaa';
}

function user_joins_room(name, roomCode) {
    // Generate room secret for user and return cookie that resp should set for browser 
    const insertUserStmt = `INSERT INTO secrets (room_id, name, secret, expiration) VALUES (?, ?, ?, datetime('now'))`;

    const secret = generate_secret_stub();

    return new Promise(function(resolve, reject) {
        db.exec(insertUserStmt, roomCode, name, secret, function (err, res) {
            if (!row) {
                reject();
            }
            resolve(secret);
        });
    });

}

function create_user_secret() {
    
}

async function validate_user(roomTarget, userName, userSecret) {
    const getSecret = 'SELECT * FROM secrets WHERE room_id = ? AND user = userName LIMIT 1';

    return new Promise(function(resolve, reject) {
        db.run(getSecret, roomTarget, function (err, row) {
            row ? resolve(true) : reject('Err: User did not have valid secret');
        });
    });
}

async function userValidator (req, res, next) {
    try {
        await validate_user(req.roomTarget, req.user, req.cookies.x_bowl_secret)
    }
    catch {
        throw new Error('User: invalid secret for room & user');
    }
}

init_db();


module.exports = { create_room, userValidator }

