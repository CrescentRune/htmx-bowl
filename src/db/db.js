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

function user_joins_room() {

}

function validate_user(roomTarget,) {

}


init_db();


module.exports = { create_room, }

