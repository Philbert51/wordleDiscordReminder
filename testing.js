const mySQLConnection = require('mysql2');
const { Connection } = require('mysql2/promise');
const connection = mySQLConnection.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'wordle_reminder'
});
let isAuthenticatedMySQL = false;
let isConnectedMySQL = false;


const connectToDatabase = (retries) => {
    connection.connect((a, b, c, d) => {
        let totalRetries = 0;
        if (!(retries === undefined)) totalRetries = retries;
        if (!(connection.state === 'authenticated')) {
            if (totalRetries < 3) {
                console.log('MYSQL failed to authenticate : wrong username/password');
                console.log('>>>>> mysql rejected login credentials');
                console.log('>>>>> retrying login :'); totalRetries++;
                setTimeout(() => { connectToDatabase(totalRetries) }, 5000);
                return;
            }
            else {
                console.log('bot gives up connecting to mysql');
                return;
            }
        }
        console.log('Successfully authenticated to mysql');
    });
}

connectToDatabase();

