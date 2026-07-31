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
const commandNameDurationReminder = 'reminder_interval';
const commandNameLogger = 'log_message_info';
const commandNameFinish = 'finish';
const commandNameUnfinish = 'unfinish';
const commandNameFinishAll = 'finish_all';

const commandsToCreate = [];


// let removeAdminCommand = undefined;
// let adminCommand = undefined;
// let wordlersCommand = undefined;
// let whoisnotdoneCommand = undefined;
let durationCommand = undefined;
let finishCommand = undefined;
let unfinishCommand = undefined;
let finishAllCommand = undefined;
let loggerCommand = undefined;


async function main() {
    try {
        bot.login('MTAwODY5OTI0NDk0MjczMzMzMg.GPoyCt.Cs17woxP6al1h6cj0Ikpsu-YTUph6tLjft3CaM');

        // wordlersCommand = new dcJS.SlashCommandBuilder();
        // wordlersCommand.setName(commandNameListUsers);
        // wordlersCommand.setDescription('gives the list of current wordlers');

        // whoisnotdoneCommand = new dcJS.SlashCommandBuilder();
        // whoisnotdoneCommand.setName(commandNamewhoisnotdone);
        // whoisnotdoneCommand.setDescription("gives the list of who's not done yet");

        adminCommand = new dcJS.SlashCommandBuilder();
        adminCommand.setName(commandNameAdminUser);
        adminCommand.setDescription('make someone an admin');
        adminCommand.addUserOption((option) => {
            option.setName('user');
            option.setDescription('make this user an admin');
            option.setRequired(true);
            return option;
        });

        removeAdminCommand = new dcJS.SlashCommandBuilder(); //changed
        removeAdminCommand.setName(commandNameRemoveAdminUser);
        removeAdminCommand.setDescription('de-admin');
        removeAdminCommand.addUserOption((option) => {
            option.setName('user');
            option.setDescription('de-admin this person');
            option.setRequired(true);
            return option;
        });

        // durationCommand = new dcJS.SlashCommandBuilder();
        // durationCommand.setName(commandNameDurationReminder);
        // durationCommand.setDescription('set duration interval reminder');
        // durationCommand.addIntegerOption((option) => {

        //     option.setName('interval');
        //     option.setDescription('type : int 1 <= x <= 23');
        //     option.setRequired(true);
        //     return option;

        // });
        // loggerCommand = new dcJS.SlashCommandBuilder();
        // loggerCommand.setName(commandNameLogger);
        // loggerCommand.setDescription('used for debugging purposes');
        // loggerCommand.addStringOption((option) => {

        //     option.setName('messageid');
        //     option.setDescription('message ID : ');
        //     option.setRequired(true);
        //     return option;

        // });

        // finishCommand = new dcJS.SlashCommandBuilder();
        // finishCommand.setName(commandNameFinish);
        // finishCommand.setDescription("finish someone's wordle");
        // finishCommand.addUserOption((option) => {

        //     option.setName('user');
        //     option.setDescription('user : ');
        //     option.setRequired(true);
        //     return option;

        // });

        // unfinishCommand = new dcJS.SlashCommandBuilder();
        // unfinishCommand.setName(commandNameUnfinish);
        // unfinishCommand.setDescription("unfinish someone's wordle");
        // unfinishCommand.addUserOption((option) => {

        //     option.setName('user');
        //     option.setDescription('user : ');
        //     option.setRequired(true);
        //     return option;

        // });

        
        // finishAllCommand = new dcJS.SlashCommandBuilder();
        // finishAllCommand.setName(commandNameFinishAll);
        // finishAllCommand.setDescription('finish all idk');

        commandsToCreate.push();

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



bot.on('clientReady', async () => {

    try {
        console.log('client ready');
        await bot.guilds.fetch(serverID).then(async (server) => {

            await Promise.all([server.commands.delete('1532712077419089930'),
            server.commands.delete('1532712075321806870')
            ]);
            await Promise.all([server.commands.create(adminCommand),
            server.commands.create(removeAdminCommand),
            ]);

        });
        console.log('success');

    } catch (e) {

        console.log(e.stack);

    }

});



main();