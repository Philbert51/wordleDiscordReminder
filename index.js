const dcJS = require('discord.js');
const cron = require('node-cron');
const dotenvi = require('dotenv'); dotenvi.config({ path: ['./botToken.env'] });
const token = process.env.token;
const bot = new dcJS.Client({ intents: [1, 2, 512, 32768] });
const mySQLConnection = require('mysql2');
let onReady = false;
let channelObject = null;
let usersID = [];
let notDone = Array.from(usersID);
let cantReply = [];
let iteration = 0;
let authorizedUserID = ['480316607223169045'];
let intervalHourlyReminder = 7;
let reminderList = [
    '🟩🟨⬜',
    "^_____^ is wordling time! (((φ(◎ロ◎;)φ)))",
    'wordle? (∪.∪ )...zzz',
    'w o r d l e ಥ_ಥ',
];

// //ssgn server
// const serverID = '781739449288491041';
// const wordleRoleID = '1529803137131741345'; //⚠⚠⚠⚠⚠change when release
// const channelID = '824499899306737674';
// real SERVER
const serverID = '837944329745727508';
const wordleRoleID = '1511977531535003678'; //⚠⚠⚠⚠⚠change when release
const channelID = '837944329745727510';

//wordleBotid
const wordleBotID = '1211781489931452447';

//keywords
const listUsersIDKeyword = '[wordlers';
const intervalReminderKeyword = '[duration ';
const finishWordleKeyword = '[finished_for_the_day ';
const unfinishedWordleKeyword = '[undo_finish ';
const finishAllUserKeyword = '[finish_all';
const whoIsNotDoneKeyword = '[whoisnotdone';

//initialization

let button = new dcJS.ButtonBuilder();
button.setCustomId("btnYes");
button.setLabel("yes, stop reminding pls!");
button.setStyle(1);

let embed = new dcJS.EmbedBuilder();
embed.setColor(dcJS.Colors.Default);
embed.setTitle('Reminder');

let row = new dcJS.ActionRowBuilder();
row.addComponents(button);

bot.login(token);

// const server = bot.guilds.cache.get(server); <<< idk what is this

bot.on('messageCreate', function (message) {
    try {
        if (!onReady) return; //if not ready exit
        if (!message.author.bot && authorizedUserID.includes(message.author.id)) {
            const messageContent = message.content;
            if (messageContent === listUsersIDKeyword) {
                refreshUser();
                if (usersID.length > 0) {
                    let contentToSend = '';
                    for (const id of usersID) {
                        contentToSend += '<@' + id + '>';
                    }
                    message.reply({ content: contentToSend, allowedMentions: { users: [message.author.id] } });
                }
                else {
                    message.reply({ content: 'Nobody listed yet!' });
                }
            }
            else if (messageContent.startsWith(intervalReminderKeyword)) {
                const tempArray = messageContent.split(" ");
                if (tempArray.length !== 2) throw new Error("changeInterval format not valid");
                changeInterval(tempArray[1]);
            }
            else if (messageContent.startsWith(finishWordleKeyword)) {
                const tempArray = messageContent.split(" ");
                if (tempArray.length !== 2) throw new Error("changeInterval format not valid");
                removeNotDone(tempArray[1]);
            }
            else if (messageContent.startsWith(unfinishedWordleKeyword)) {
                const tempArray = messageContent.split(" ");
                if (tempArray.length !== 2) throw new Error("changeInterval format not valid");
                addNotDone(tempArray[1]);
            }
            else if (messageContent.startsWith(finishAllUserKeyword)) {
                finishAll();
            }
            else if (messageContent === whoIsNotDoneKeyword) {
                let temp = '';
                if (notDone.length > 0) {
                    for (const id of notDone) {
                        temp += '<@' + id + '>';
                    }
                    message.reply({ content: temp, allowedMentions: { users: [message.author.id] } });
                }
                else {
                    temp = 'everyone is done!';
                    message.reply({ content: temp });
                }
            }
        }
    }
    catch (E) {
        console.log("error at listening messageCreate : " + E);
    }
});


bot.on('interactionCreate', async (evt) => {
    try {
        if (!onReady) return;
        if (evt.customId === 'btnYes') {
            const evtUserId = evt.user.id;
            if (!cantReply.includes(evtUserId)) {
                addCantReply(evtUserId);
                await evt.reply({ content: 'Loading....', flags: dcJS.MessageFlags.Ephemeral });
                const index = notDone.indexOf(evtUserId)
                if (index !== -1) {
                    const contentToSend = 'ok, will stop reminding you today!';
                    await evt.editReply({ content: contentToSend, flags: dcJS.MessageFlags.Ephemeral });
                    userFinishedWordle(index);
                    return;
                }
                const contentToSend = "you are already done or you're not on the list!!";
                await evt.editReply({ content: contentToSend, flags: dcJS.MessageFlags.Ephemeral });
            }
        }
    } catch (errr) {
        console.log("Error at interaction create : " + errr);
    }
});

bot.on('clientReady', async () => {
    try {
        const server = await bot.guilds.fetch(serverID);
        await server.members.fetch();
        await server.roles.fetch();
        refreshUser();
        onReady = true;
        console.log("---> bot ready!");
        // refreshUser(); console.log("---> user refreshed!");
        // sendMessage(); console.log("---> sendMessage()!");
    }
    catch (errr) {
        console.log("Error at " + errr);
    }
});


function reminderRandomizer() {
    return reminderList[Math.floor(Math.random() * reminderList.length)];
}

function sendReminder() {
    try {
        if (!onReady) return;
        if (notDone.length === 0) {
            console.log("no users inside notDone!");
            return;
        }
        let contentToSend = "";
        embed.setDescription(reminderRandomizer());
        for (const id of notDone) {
            contentToSend += '||<@' + id + '>||';
        }
        resetCantReply();
        channelObject = bot.channels.cache.get(channelID);
        channelObject.send({ content: contentToSend, embeds: [embed], components: [row] });
    }
    catch (errr) {
        console.log("Error at " + errr);
    }
}

function addUser(idUser) {
    if (!usersID.includes(idUser)) usersID.push(idUser);
}

function removeUser(idUser) {
    if (typeof idUser !== 'string') {
        throw new Error('removeUser idUser must be string');
    }
    if (isNaN(parseInt(idUser))) {
        throw new Error('Error : removeUser idUser cannot contain non-integer');
    }
    if (usersID.includes(idUser)) usersID.splice(usersID.indexOf(idUser), 1);
}

function addNotDone(idUser) {
    if (typeof idUser !== 'string') throw new Error('on addNotDone(idUser) : idUser must be string');
    if (isNaN(parseInt(idUser))) console.log('on addNotDone(idUser) : idUser must be all number');
    if (!notDone.includes(idUser)) notDone.push(idUser);
}

function removeNotDone(idUser) {
    if (typeof idUser !== 'string') throw new Error('on removeNotDone(idUser) : idUser must be string');
    if (isNaN(parseInt(idUser))) console.log('on removeNotDone(idUser) : idUser must be all number');
    if (notDone.includes(idUser)) notDone.splice(notDone.indexOf(idUser), 1);
}

function finishAll() {
    notDone = [];
}

function userFinishedWordle(idUserIndex) {
    if (idUserIndex !== -1) {
        notDone.splice(idUserIndex, 1);
        return;
    }
    throw new Error("userFinishedWordle received index -1 : user not found");
}

function addCantReply(idUser) {
    if (!cantReply.includes(idUser)) {
        cantReply.push(idUser);
    }
}

function removeCantReply(idUser) {
    if (typeof idUser !== 'string') {
        throw new Error('removeCantReply idUser must be string');
    }
    if (isNaN(parseInt(idUser))) {
        throw new Error('Error removeCantReply : idUser cannot contain non-integer');
    }
    const index = cantReply.indexOf(idUser);
    if (index !== -1) cantReply.splice(index, 1);
}

function resetCantReply() {
    cantReply = [];
}

function resetFinishedWordle() {
    notDone = Array.from(usersID);
    resetCantReply();
}

function refreshUser() {
    const server = bot.guilds.cache.get(serverID);
    if (server === null) throw new Error('error at clientReady : ' + 'server is null');
    const role = server.roles.cache.get(wordleRoleID);    //
    //idk has to add???
    const updatedRoleID = [];
    for (const value of role.members.keys()) updatedRoleID.push(value);
    for (const value of updatedRoleID) { //
        if (!usersID.includes(value)) {
            addUser(value);
            addNotDone(value);
        }
    }
    const temp = Array.from(usersID);
    for (const value of temp) {
        if (!updatedRoleID.includes(value)) { //if usersID has something that updatedRoleID doesn't have
            removeUser(value);
            removeNotDone(value);
        }
    }
    // console.log(">>>>>>>>>> old member :"); console.log(usersID);
    // console.log(">>>>>>>>>> new member :"); console.log(updatedRoleID);
    // iteration++;
    // console.log(iteration + " starts at 1");
}

function changeInterval(duration) {
    if (isNaN(parseInt(duration))) throw new Error("Interval duration must be a number!");
    intervalHourlyReminder = duration;
}

// setInterval(() => {
//     refreshUser();
//     sendMessage();
// }, 3000);

// setInterval(() => {
//     resetFinishedWordle();
// }, 10000);


cron.schedule('0 */' + intervalHourlyReminder + ' * * *', () => { //change this when release
    refreshUser();
    sendReminder();
}, { timezone: 'UTC' });

cron.schedule('0 17 * * *', () => { //restart the list
    resetFinishedWordle();
}, { timezone: 'UTC' });
