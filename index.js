const dcJS = require('discord.js');
const cron = require('node-cron');
const dotenvi = require('dotenv'); dotenvi.config({ path: ['./botToken.env'] });
const fileSys = require('fs');
const { parse } = require('path');
const bot = new dcJS.Client({ intents: [1, 2, 512, 32768] });
const token = process.env.token;
const fileName = 'database.json';
let fixedAdminUserIDList = ['480316607223169045'];
let globalFileData = {};
globalFileData.adminUserIDList = [];
globalFileData.usersID = [];
globalFileData.notDone = [];
globalFileData.notDone.push(...globalFileData.usersID);
let onReady = false;
let cantReply = [];
let intervalHourlyReminder = 12;
let reminderList = [
    '🟩🟨⬜',
    "^_____^ is wordling time! (((φ(◎ロ◎;)φ)))",
    'wordle? (∪.∪ )...zzz',
    'w o r d l e ಥ_ಥ',
];

//⚠⚠⚠⚠⚠checklist to change before commiting 
//channels and server IDs
//check delete and change comment

//ssgn server
// const serverID = '781739449288491041';
// const wordleRoleID = '1529803137131741345'; //⚠⚠⚠⚠⚠change when release
// const mainChannelID = '824499899306737674';
// real SERVER
const serverID = '837944329745727508';
const wordleRoleID = '1511977531535003678'; //⚠⚠⚠⚠⚠change when release
const mainChannelID = '837944329745727510';

//wordleBotid
const wordleBotID = '1211781489931452447';

//keywords
const listUsersIDKeyword = '[wordlers';
const intervalReminderKeyword = '[duration ';
const finishWordleKeyword = '[finished_for_the_day ';
const unfinishedWordleKeyword = '[undo_finish ';
const finishAllUserKeyword = '[finish_all';
const whoIsNotDoneKeyword = '[whoisnotdone';
const loggerKeyword = '[log ';

const commandNameListUsers = 'wordlers';
const commandNameAdminUser = 'admin';
const commandNameRemoveAdminUser = 'remove_admin';
const commandNamewhoisnotdone = 'whoisnotdone';
const commandNameDurationReminder = 'reminder_interval';
const commandNameLogger = 'log_message_info';
const commandNameFinish = 'finish';
const commandNameUnfinish = 'unfinish';
const commandNameFinishAll = 'finish_all';

//initialization

const undoButtonCustomId = 'btnUndo ';

const reminderButton = new dcJS.ButtonBuilder();
reminderButton.setCustomId("btnYes");
reminderButton.setLabel("yes, stop reminding pls!");
reminderButton.setStyle(1); //the blue button


const reminderEmbed = new dcJS.EmbedBuilder();
reminderEmbed.setColor(dcJS.Colors.Default);
reminderEmbed.setTitle('Reminder');

const reminderRow = new dcJS.ActionRowBuilder();
reminderRow.addComponents(reminderButton);


async function main() {
    try {

        loadDatabaseData();

        for (const value of fixedAdminUserIDList) {

            if (!globalFileData.adminUserIDList.includes(value)) {

                globalFileData.adminUserIDList.push(value);

            }

        }

        bot.login(token);

    } catch (e) {

        console.log(e.stack);

    }
}

bot.on('clientReady', async () => {
    try {
        // await server.members.fetch();
        // await server.roles.fetch();
        // await server.channels.fetch();
        await refreshAllCache();
        refreshUsersIDandNotDone();
        saveGlobalFileDataToJSON();
        onReady = true;
        console.log("---> bot ready!");
        // await sendAutoClick(await bot.channels.cache.get(channelID).messages.fetch('1531583517106896977'), '480316607223169045');
        // removeNotDone('480316607223169045');
    }
    catch (errr) {

        console.log(errr.stack);

    }
});

// const server = bot.guilds.cache.get(server); <<< idk what is this

bot.on('messageCreate', async function (messageObject) {
    try {
        if (!onReady) { console.log('received event messageCreate but bot is not ready yet.'); return; } //if not ready exit
        const messageContent = messageObject.content;
        if (messageObject.author.id === wordleBotID) {
            if (messageContent.includes('was playing') || messageContent.includes('were playing')) {

                if (messageObject.attachments.firstKey() == null) {

                    console.log('found was/were playing but no attachments was detected');
                    return;
                }
                if (messageObject.attachments.get(messageObject.attachments.firstKey()).description.includes('unfinished')) {
                    console.log('Attachment has unfinished');
                    return;
                }
                const interactedUserID = messageObject.interactionMetadata.user.id;
                if (!globalFileData.usersID.includes(interactedUserID)) return; //ignore if not in wordlers role
                await sendAutoClick(messageObject, interactedUserID);
                removeNotDone(interactedUserID);

            }
        }
        if (!messageObject.author.bot && globalFileData.adminUserIDList.includes(messageObject.author.id)) {
            
        }
    }
    catch (E) {

        console.log(E.stack);

    }
    finally {

        saveGlobalFileDataToJSON();

    }
});

bot.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!onReady) { console.log('received messageUpdate event but bot is not ready yet.'); return; }
    try {
        const messageContent = newMessage.content;
        if (newMessage.author.id === wordleBotID) {
            if (messageContent.includes('was playing') || messageContent.includes('were playing')) {
                if (newMessage.attachments.firstKey() == null) {
                    console.log('found was/were playing but no attachments was detected');
                    return;
                }
                if (newMessage.attachments.get(newMessage.attachments.firstKey()).description.includes('unfinished')) {
                    console.log('Attachment has unfinished');
                    return;
                }
                const interactedUserID = newMessage.interactionMetadata.user.id
                await sendAutoClick(newMessage, interactedUserID);
                removeNotDone(interactedUserID);
            }
        }
    } catch (e) {

        console.log(e.stack);

    } finally {

        saveGlobalFileDataToJSON();

    }
});

bot.on('guildMemberUpdate', (oldMemberInfo, newMemberInfo) => {
    try {

        if (!onReady) {

            console.log('received guildMemberUpdate event but bot not ready.\n' +
                'received event : old >>>>>>>>>>\n' +
                oldMemberInfo + '\n' +
                'new >>>>>>>>>>>>>>>>>>>>\\n' +
                newMemberInfo + '\n' +
                '>>>>>>>>>>>>>>>>>>>>'
            );
            return;

        }
        if (oldMemberInfo.roles.cache !== newMemberInfo.roles.cache) {

            refreshUsersIDandNotDone();

        }

    } catch (e) {

        console.log(e.stack);

    }
    finally {

        saveGlobalFileDataToJSON();

    }
});


bot.on('interactionCreate', async (evt) => {

    try {

        if (!onReady) return;
        if (evt.isButton()) { //for button related stuff!!

            if (evt.customId === 'btnYes') {

                const evtUserId = evt.user.id;
                if (!cantReply.includes(evtUserId)) {

                    addCantReply(evtUserId);
                    await evt.reply({ content: 'Loading....', flags: dcJS.MessageFlags.Ephemeral });
                    const index = globalFileData.notDone.indexOf(evtUserId)
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
            else if (evt.customId.startsWith(undoButtonCustomId)) {

                undoButton(evt);

            }

        }
        else if (evt.isCommand()) { //for all command related stuff!!

            if (globalFileData.adminUserIDList.includes(evt.user.id)) {//for commands that needs permission

                if (evt.commandName === commandNameListUsers) { //listing wordlers

                    sendUserIDList(evt);

                }
                else if (evt.commandName === commandNameAdminUser) {

                    makeUserIDAdmin(evt, evt.options.getUser('userid').id);

                }
                else if (evt.commandName === commandNameRemoveAdminUser) {

                    removeUserIDAdmin(evt, evt.options.getUser('userid').id);

                }
                else if (evt.commandName === commandNamewhoisnotdone) {

                    whoisnotdone(evt);

                }
                else if (evt.commandName === commandNameLogger) {

                    logMessageInfo(evt, evt.options.getString('messageid'));

                }
                else if (evt.commandName === commandNameFinish) {

                    finishWordle(evt);

                }
                else if (evt.commandName === commandNameUnfinish) {

                    unfinishWordle(evt);

                }
                else if (evt.commandName === commandNameFinishAll) {

                    finishAll(evt);

                }
                else if (evt.commandName === commandNameDurationReminder) {

                    changeInterval(evt);

                }

            }
            else {


            }

        }

    } catch (errr) {

        console.log(errr.stack);

    }
    finally {

        saveGlobalFileDataToJSON();

    }
});

function finishWordle(event) {

    const userID = event?.options?.getUser('user').id;
    if (userID != null) {

        removeNotDone(userID);
        event.reply({ content: 'finish success.' });

    }
    else {

        event.reply({ content: 'data corrupted somehow??????????'});

    }

}

function unfinishWordle(event) {

    const userID = event?.options?.getUser('user').id;
    if (userID != null) {

        addNotDone(userID);
        event.reply({ content: 'unfinish success.' });

    }
    else {

        event.reply({ content: 'data corrupted somehow??????????'});

    }

}


function whoisnotdone(event) {

    let temp = '';
    if (globalFileData.notDone.length > 0) {

        for (const id of globalFileData.notDone) {
            temp += '<@' + id + '>';
        }
        event.reply({ content: temp, allowedMentions: { repliedUser: true } });

    }
    else {

        temp = 'everyone is done!';
        event.reply({ content: temp });

    }

}

async function undoButton(interactionEvent) {

    const tempArray = interactionEvent.customId.split(' ');
    if (tempArray.length !== 2) {

        console.log('btnUndo received more or less than 2 array keys');
        return;

    }
    const intendedUserID = tempArray[1];
    if (!(interactionEvent.user.id === intendedUserID)) {

        console.log('someone other than the targeted user clicked the button.');
        console.log('Intended for : ' + intendedUserID + ', clicked by : ' + evt.user.id);
        return;

    }
    addNotDone(intendedUserID);
    await interactionEvent.reply({ content: 'ok!', flags: dcJS.MessageFlags.Ephemeral });
    const currentRow = dcJS.ActionRowBuilder.from(interactionEvent.message.components);
    let button = '';
    if (!(currentRow == null)) {

        for (const key in Object.keys(currentRow.data)) {

            if (!(typeof currentRow.data[key] === 'object')) continue;
            button = dcJS.ButtonBuilder.from((currentRow.data[key].components)[0]);
            if (button == null) continue;
            if (!button.data.custom_id.startsWith(undoButtonCustomId)) continue;
            button.setDisabled(true);
            delete currentRow.data[key];
            currentRow.addComponents(button);

        }
        await interactionEvent.message.edit({ components: [currentRow] });

    }
    else {

        console.log('currentRow is null');

    }

}

function makeUserIDAdmin(event, idUser) {

    if (fixedAdminUserIDList.includes(idUser)) {

        event.reply({ content: "You can't add <@" + idUser + '>', allowedMentions: { repliedUser: true } });
        return;

    }
    if (addAdminUser(idUser)) {

        event.reply({ content: 'Successfully added : <@' + idUser + '>', allowedMentions: { repliedUser: true } });

    }
    else {

        event.reply({ content: "You can't add <@" + idUser + '>', allowedMentions: { repliedUser: true } });

    }
}

function removeUserIDAdmin(event, idUser) {

    if (fixedAdminUserIDList.includes(idUser)) {

        event.reply({ content: "You can't remove <@" + idUser + '>', allowedMentions: { repliedUser: true } });
        return;

    }
    if (removeAdminUser(idUser)) {

        event.reply({ content: 'Successfully removed : <@' + idUser + '>', allowedMentions: { repliedUser: true } });

    } else {

        event.reply({ content: "You can't remove <@" + idUser + '>', allowedMentions: { repliedUser: true } });

    }
}

function sendUserIDList(event) {

    if (globalFileData.usersID.length > 0) {

        let contentToSend = '';
        for (const id of globalFileData.usersID) {

            contentToSend += '<@' + id + '>';

        }
        event.reply({ content: contentToSend, allowedMentions: { repliedUser: true } });

    }
    else {

        event.reply({ content: 'Nobody listed yet!' });

    }

}



function addAdminUser(idUser) {

    if (typeof idUser !== 'string' || isNaN(parseInt(idUser))) {

        console.log('Error addAdminUser : type of idUser argument is not a string or is not a whole integer');
        console.log('idUser : ' + idUser);
        return;

    }
    if (!globalFileData.adminUserIDList.includes(idUser)) {

        globalFileData.adminUserIDList.push(idUser);
        return true;

    }
    else {

        console.log('adminUserIDList already contains : ' + idUser);
        return false;

    }

}


function removeAdminUser(idUser) {

    if (typeof idUser !== 'string' || isNaN(parseInt(idUser))) {

        console.log('Error removeAdminUser : type of idUser argument is not a string or is not a whole integer');
        console.log('idUser : ' + idUser);
        return;

    }
    if (globalFileData.adminUserIDList.includes(idUser)) {

        globalFileData.adminUserIDList.splice(globalFileData.adminUserIDList.indexOf(idUser), 1);
        return true;

    }
    else {

        console.log('adminUserIDList does not contain : ' + idUser);
        return false;

    }

}




async function sendAutoClick(newMessageObject, interactedUserID) {

    if (!globalFileData.notDone.includes(interactedUserID)) {

        console.log('user id : ' + interactedUserID + 'already completed wordle but still received event to fire');
        console.log(newMessageObject);
        return;

    }
    const undoButton = new dcJS.ButtonBuilder();
    undoButton.setCustomId(undoButtonCustomId + interactedUserID);
    undoButton.setLabel('Undo');
    undoButton.setStyle(dcJS.ButtonStyle.Danger);

    const undoRow = new dcJS.ActionRowBuilder();
    undoRow.addComponents(undoButton);


    await newMessageObject.reply({
        content: '<@' + interactedUserID +
            '> I automatically detected your completion. \n' +
            'If you think this is a mistake press Undo below',
        components: [undoRow]
    });

}

function loadDatabaseData() {

    if (fileSys.existsSync('database.json')) {
        globalFileDataSave = JSON.parse(fileSys.readFileSync('database.json', 'utf-8'));
        return true;

        for (const key in Object.keys(globalFileData)) {

            if (globalFileDataSave[key] != null) {

                globalFileData[key] = globalFileDataSave[key];
                console.log('key ' + key + ' is using cached version');

            }
            else {

                console.log('key ' + key + ' not found in cache, made an empty value instead');

            }

        }
    }
    return false;

}

function reminderRandomizer() {

    return reminderList[Math.floor(Math.random() * reminderList.length)];

}

function sendReminder(theChannelID) {
    try {

        if (globalFileData.notDone.length === 0) {

            console.log("no users inside notDone!");
            return;

        }
        let contentToSend = "";
        reminderEmbed.setDescription(reminderRandomizer());
        for (const id of globalFileData.notDone) {

            contentToSend += '||<@' + id + '>||';

        }
        const channelObject = bot.channels.cache.get(theChannelID);
        channelObject.send({ content: contentToSend, embeds: [reminderEmbed], components: [reminderRow] });

    }
    catch (errr) {

        console.log(errr.stack);

    }

}

function addUser(idUser) {
    if (!globalFileData.usersID.includes(idUser)) { globalFileData.usersID.push(idUser); }
}

function removeUser(idUser) {
    if (typeof idUser !== 'string') {
        throw new Error('removeUser idUser must be string');
    }
    if (isNaN(parseInt(idUser))) {
        throw new Error('Error : removeUser idUser cannot contain non-integer');
    }
    if (globalFileData.usersID.includes(idUser)) globalFileData.usersID.splice(globalFileData.usersID.indexOf(idUser), 1);
}

function addNotDone(idUser) {
    if (typeof idUser !== 'string') throw new Error('on addNotDone(idUser) : idUser must be string');
    if (isNaN(parseInt(idUser))) { console.log('on addNotDone(idUser) : idUser must be all number'); return; }
    if (!globalFileData.notDone.includes(idUser)) {
        globalFileData.notDone.push(idUser);
    }
    else {
        console.log('notDone already has idUser ' + idUser);
    }
}

function saveGlobalFileDataToJSON() {

    fileSys.writeFileSync(fileName, JSON.stringify(globalFileData), 'utf-8');

}


function removeNotDone(idUser) {

    if (typeof idUser !== 'string') throw new Error('on removeNotDone(idUser) : idUser must be string');
    if (isNaN(parseInt(idUser))) { console.log('on removeNotDone(idUser) : idUser must be all number'); return; }
    if (globalFileData.notDone.includes(idUser)) {
        globalFileData.notDone.splice(globalFileData.notDone.indexOf(idUser), 1);
    }
    else {
        console.log('notDone doesnt have idUser ' + idUser);
    }

}

function finishAll(event) {

    if (globalFileData.notDone.length > 0) {

        globalFileData.notDone.length = 0;
        event.reply({ content : 'cleared everyone!'});

    }
    else {

        event.reply({ content : 'Everybody is done, nothing to clear'});

    }

}

function userFinishedWordle(idUserIndex) {

    if (idUserIndex !== -1) {

        globalFileData.notDone.splice(idUserIndex, 1);
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

    cantReply.length = 0;

}

function unfinishEveryone() {

    globalFileData.notDone.length = 0;
    globalFileData.notDone.push(...globalFileData.usersID);

}

function refreshUsersIDandNotDone() {
    const server = bot.guilds.cache.get(serverID);
    if (server == null) throw new Error('error at clientReady : ' + 'server is null');
    const role = server.roles.cache.get(wordleRoleID);    //
    //idk has to add???
    const updatedRoleID = [];
    for (const value of role.members.keys()) updatedRoleID.push(value);
    for (const value of updatedRoleID) { //

        if (!globalFileData.usersID.includes(value)) {

            addUser(value);
            addNotDone(value);

        }

    }
    const temp = Array.from(globalFileData.usersID); //you can't traverse through and modify the 
    for (const value of temp) {                                         //array while looping

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

function changeInterval(event) {

    const tempInterval = parseInt(event.options.getInteger('interval'));
    if (isNaN(tempInterval)) throw new Error("Interval duration must be a number!");
    if (tempInterval < 1 || tempInterval > 23) {

        event.reply( { content : 'Not a valid number range, must be 1 <= x <= 23' });
        return;

    }
    intervalHourlyReminder = tempInterval
    scheduleHourlyReminder.destroy();
    scheduleHourlyReminder = cron.schedule('0 */' + intervalHourlyReminder + ' * * *', () => {

        if (!onReady) {

            console.log('supposed to remind but the bot is not ready yet.');
            return;

        }
        resetCantReply();
        sendReminder(mainChannelID);

    }, { timezone: 'UTC' });
    event.reply('Interval set : ' +  intervalHourlyReminder);

}

function getKeys(object) {

    if (typeof object !== 'object') {

        console.log('Error at getKeys() : ' + 'argument is not an object \n type : ' + typeof object);
        return;

    }
    if (object == null) {

        console.log('Error at getKeys() : ' + 'argument is null or undefined.');
        return;

    }
    console.log('>>>key properties>>>');
    console.log(Object.getOwnPropertyNames(object));
    console.log(Object.getPrototypeOf(object));
    console.log('>>>key properties>>>');

}

async function logMessageInfo(event/* the channel*/, messageID /*the message ID to look up*/) {

    if (typeof event.channelId !== 'string') {

        console.log('Error in logMessageInfo : logMessageInfo argument must be string format');
        return;

    }
    if (isNaN(parseInt(event.channelId))) {

        console.log('Error in logMessageInfo : logMessageInfo argument must be int parse-able');
        return;

    }
    const channelObject = await bot.channels.fetch(event.channelId);
    if (channelObject == null) {

        console.log('Error logMessageInfo : channel not found');
        return;

    }
    const messagesObject = channelObject.messages;
    if (messagesObject == null) {

        console.log('Error logMessageInfo : message not found');
        return;

    }
    const message = await messagesObject.fetch(messageID);
    console.log(message);

}

async function addDelay(miliseconds) {
    //trying to addDelay
    return new Promise((resolve, reject) => {

        setTimeout(() => {

            resolve();

        }, miliseconds);

    });
}

async function refreshAllCache() {

    let successFetch = 0;

    await bot.guilds.fetch().then(async (guilds) => {

        const promises = [];
        for (const key of guilds.keys()) {

            promises.push(bot.guilds.fetch(key).then((server) => {

                const promises = [];
                promises.push(server.members.fetch());
                promises.push(server.roles.fetch());
                promises.push(server.channels.fetch().then((channels) => {

                    const promises = [];
                    for (const key of channels.keys()) {

                        const channel = channels.get(key);
                        if (channel.viewable && channel.type === dcJS.ChannelType.GuildText) {
                            promises.push(channel.messages.fetch()); successFetch++;
                        }
                    }
                    return Promise.all(promises);

                }));
                return Promise.all(promises);

            }));
            await addDelay(100);

        }
        return Promise.all(promises);
    });
    console.log('Number of success fetch : ' + successFetch);

}

let scheduleHourlyReminder = cron.schedule('0 */' + intervalHourlyReminder + ' * * *', () => {

    if (!onReady) {

        console.log('supposed to remind, but the bot is not ready yet.');
        return;

    }
    resetCantReply();
    sendReminder(mainChannelID);

}, { timezone: 'UTC' });

cron.schedule('30 18 * * *', () => {

    if (!onReady) {

        console.log('supposed to remind, but the bot is not ready yet.');
        return;
    }
    resetCantReply();
    sendReminder(mainChannelID);

}, { timezone: 'UTC' });

cron.schedule('0 17 * * *', () => { //restart the list 

    if (!onReady) {

        console.log('supposed to reset the who finished wordle list to empty, but the bot is not ready yet.');
        return;

    }
    unfinishEveryone();
    saveGlobalFileDataToJSON();
    resetCantReply();

}, { timezone: 'UTC' });

main();




