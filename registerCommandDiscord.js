const dcJS = require('discord.js');
const dotenvi = require('dotenv');
dotenvi.config({ path: 'botToken.env' });
token = process.env.token;

//ssgn server
// const serverID = '781739449288491041';
// const wordleRoleID = '1529803137131741345'; //⚠⚠⚠⚠⚠change when release
// const mainChannelID = '824499899306737674';
// real SERVER
const serverID = '837944329745727508';
const wordleRoleID = '1511977531535003678'; //⚠⚠⚠⚠⚠change when release
const mainChannelID = '837944329745727510';


const commandNameListUsers = 'wordlers';
const commandNameAdminUser = 'admin';
const commandNameRemoveAdminUser = 'remove_admin';
const commandNamewhoisnotdone = 'whoisnotdone';
const commandNameDurationReminder = 'duration';
const commandNameLogger = 'logMessageInfo';

let removeAdminCommand = undefined;
let adminCommand = undefined;
let wordlersCommand = undefined;
let durationCommand = undefined;
let undoFinishCommand = undefined;
let finishAllUserCommand = undefined;
let loggerCommand = undefined;
let whoisnotdoneCommand = undefined;

async function main() {
    try {
        bot.login('MTAwODY5OTI0NDk0MjczMzMzMg.GPoyCt.Cs17woxP6al1h6cj0Ikpsu-YTUph6tLjft3CaM');

        wordlersCommand = new dcJS.SlashCommandBuilder();
        wordlersCommand.setName(commandNameListUsers);
        wordlersCommand.setDescription('gives the list of current wordlers');

        whoisnotdoneCommand = new dcJS.SlashCommandBuilder();
        whoisnotdoneCommand.setName(commandNamewhoisnotdone);
        whoisnotdoneCommand.setDescription("gives the list of who's not done yet");

        adminCommand = new dcJS.SlashCommandBuilder();
        adminCommand.setName(commandNameAdminUser);
        adminCommand.setDescription('make someone an admin');
        adminCommand.addUserOption((option) => {
            option.setName('userid');
            option.setDescription('make this user an admin');
            option.setRequired(true);
            return option;
        });

        removeAdminCommand = new dcJS.SlashCommandBuilder();
        removeAdminCommand.setName(commandNameRemoveAdminUser);
        removeAdminCommand.setDescription('de-admin');
        removeAdminCommand.addUserOption((option) => {
            option.setName('userid');
            option.setDescription('de-admin this person');
            option.setRequired(true);
            return option;
        });

        durationCommand = new dcJS.SlashCommandBuilder();
        durationCommand.setName(commandNameDurationReminder);
        durationCommand.setDescription('set duration reminder');
        durationCommand.addIntegerOption((option) => {
            option.setName('duration');
            option.setDescription('type : int');
            option.setRequired(true);
            return option;
        });
    } catch (e) {
        console.log(e.stack);
    }

}

const bot = new dcJS.Client({
    intents: [dcJS.IntentsBitField.Flags.GuildMembers,
    dcJS.IntentsBitField.Flags.MessageContent,
    dcJS.IntentsBitField.Flags.GuildMessages,
    dcJS.IntentsBitField.Flags.Guilds]
});



bot.on('clientReady', () => {

    try {
        console.log('client ready');
        bot.guilds.fetch(serverID).then((server) => {
            Promise.all([server.commands.create(wordlersCommand),
            server.commands.create(removeAdminCommand),
            server.commands.create(adminCommand),
            server.commands.create(whoisnotdoneCommand)]);
            console.log('success');
        });
    } catch (e) {
        console.log(e.stack);
    }

});



main();