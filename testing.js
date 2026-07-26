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


// setTimeout(() => {
//     isAuthenticatedMySQL = true;
// }, 10000);

// const testingFunction = (retries) => {
//     console.log(retries);
//     let totalRetries = 0;
//     if (!(retries === undefined)) totalRetries = retries;
//     if (!isAuthenticatedMySQL) {
//         if (totalRetries < 5) {
//             totalRetries++;
//             setTimeout(() => {
//                 testingFunction(totalRetries)
//             }, 3000);
//             console.log('retrying.....');
//             return;
//         }
//         else {
//             console.log('I give up trying');
//             return;
//         }
//     }
//     console.log('mysql authenticated : ' + isAuthenticatedMySQL);
// };

// testingFunction();

