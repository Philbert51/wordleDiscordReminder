// const fileSys = require('fs');
// let fileObject = {};
// let persistentData = '';


// fileObject.notDone = notDone.toString();


// async function main() {
//     await fileSys.writeFile('database.json', JSON.stringify(fileObject), 'utf-8', (err) => {
//         if (err) console.log(err.stack);
//     });
//     if (!fileSys.existsSync('database.json')) { console.log('database.json file not found'); return; }
//     await new Promise((res, reject) => {
//         fileSys.readFile('database.json', 'utf-8', (err, databaseData) => {
//             if (err) { console.log(err.stack); return; }
//             persistentData = JSON.parse(databaseData);
//             res();
//         })
//     });
//     console.log(persistentData);
//     console.log(typeof persistentData);
// }

// main();



//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const tempArray = [1, 2, 3, 4]
let fetches = 0;
let promiseList = [];

function randomAssFetchSimulator(secondLimit) {
    fetches++;
    const processID = fetches;
    console.log('fetches : ' + fetches);
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(); console.log('processID resolved : ' + processID); onUpdate();
        }, Math.ceil(Math.random() * secondLimit) * 1000);
    })
}


async function addDelay(miliseconds) {
    //trying to addDelay
    onUpdate();
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            onUpdate();
            resolve();
        }, miliseconds);
    });
}


async function main() {
    console.log(await Promise.all(tempArray.map(async (v) => {
        onUpdate();
        console.log(v + ' runs');
        await addDelay(5000);
        const fetch = randomAssFetchSimulator(10);
        promiseList.push(fetch);
        return fetch;
    })));
    console.log('main done running');
}

function onUpdate() {
    console.log(promiseList);
}


main();



