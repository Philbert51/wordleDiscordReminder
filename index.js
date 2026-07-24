const dcJS = require('discord.js');
const cron = require('node-cron');
require('dotenv').config({ path: './botToken.env' });
const token = process.env.token;
const bot = new dcJS.Client({ intents: [1, 2, 512, 32768] });
let onReady = false;
let whereToSend = null;
let author = null;
let usersID = [];
let notDone = Array.from(usersID);
let cantReply = [];
let iteration = 0;
const keyword = '[wordlers';
//ssgn server
// const serverID = '781739449288491041';
// const wordleRoleID = '1529803137131741345';
// const channelID = '824499899306737674';
//real SERVER
const serverID = '837944329745727508';
const wordleRoleID = '1511977531535003678';
const channelID = '837944329745727510';

//initialization

let button = new dcJS.ButtonBuilder();
button.setCustomId("btnYes");
button.setLabel("Yes");
button.setStyle(1);

let embed = new dcJS.EmbedBuilder();
embed.setColor(dcJS.Colors.Default);
embed.setTitle('Reminder');
embed.setDescription('Have you done your wordle?');
let row = new dcJS.ActionRowBuilder();

row.addComponents(button);

bot.login(token);


// const server = bot.guilds.cache.get(server); <<< idk what is this

bot.on('messageCreate', function (message) {
    try {
    if (onReady) {
        if (!message.author.bot && message.content === keyword) {
            refreshUser();
            if (usersID.length > 0) {
                let contentToSend = '';
                for (const id of usersID) {
                    contentToSend += '<@' + id + '>';
                }
                message.reply({ content: contentToSend, allowedMentions: { User: [] } });
            }
            else {
                message.reply({ content: 'Nobody listed yet!' });
            }
        }
    }}
    catch (E) {
        console.log("error at listening messageCreate : " + E);
    }
});


bot.on('interactionCreate', async (evt) => {
    try {
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
        // await refreshServer(serverID); console.log("---> server refreshed fetched!");
        // refreshUser(); console.log("---> user refreshed!");
        // sendMessage(); console.log("---> sendMessage()!");
    }
    catch (errr) {
        console.log("Error at " + errr);
    }
});


function sendMessage() {
    try {
        if (onReady) {
            if (notDone.length === 0) {
                console.log("no users inside notDone!");
                return;
            }
            let contentToSend = "";
            for (const id of notDone) {
                contentToSend += '||<@' + id + '>||';
            }
            resetCantReply();
            whereToSend = bot.channels.cache.get(channelID);
            whereToSend.send({ content: contentToSend, embeds: [embed], components: [row] });
        }
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
    if (!notDone.includes(idUser)) notDone.push(idUser);
}

function removeNotDone(idUser) {
    if (notDone.includes(idUser)) notDone.splice(notDone.indexOf(idUser), 1);
}

function userFinishedWordle(idUserIndex) {
    if (idUserIndex !== -1) {
        notDone.splice(idUserIndex, 1);
        return;
    }
    throw new Error("userFinishedWordle received index -1 : user not found");
}

// function userUnfinishedWordle(idUser) { //adding user back to the list of notDone, unfinishedWordle
//     if (typeof idUser !== 'string') {s
//         throw new Error('userUnfinishedWordle idUser must be string');
//     }
//     if (isNaN(parseInt(idUser))) {
//         throw new Error('Error : userUnfinishedWordle idUser cannot contain non-integer');
//     }
//     const index = notDone.indexOf(idUser);
//     if (index !== -1) {
//         notDone.splice(index, 1);
//     }
//     notDone.push(idUser);
// }

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
    console.log(">>>>>>>>>> old member :"); console.log(usersID);
    console.log(">>>>>>>>>> new member :"); console.log(updatedRoleID);
    iteration++;
    console.log(iteration + " starts at 1");
}

async function refreshServer(serverID) {

    await server.roles.fetch();
}

// setInterval(() => {
//     refreshUser();
//     sendMessage();
// }, 3000);

// setInterval(() => {
//     resetFinishedWordle();
// }, 10000);


cron.schedule('0 */3 * * *', () => { //change this when release
    refreshUser();
    sendMessage();
}, { timezone: 'UTC' });

cron.schedule('0 17 * * *', () => { //restart the list
    resetFinishedWordle();
}, { timezone: 'UTC' });
