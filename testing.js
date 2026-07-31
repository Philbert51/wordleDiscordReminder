const dcJS = require('discord.js');
const dotenvi = require('dotenv'); dotenvi.config({ path: ['./botToken.env'] });
const wordlers = new dcJS.SlashCommandBuilder();
const bot = new dcJS.Client({ intents: [1, 2, 512, 32768] });
const token = process.env.token;

wordlers.setName('wordlers');
wordlers.setDescription('list of wordlers');

const serverID = '781739449288491041';
const wordleRoleID = '1529803137131741345'; //⚠⚠⚠⚠⚠change when release
const mainChannelID = '824499899306737674';

bot.login(token);

bot.on('clientReady', () => {
    bot.guilds.fetch(serverID).then ((server) => {
    });
});

bot.on('interactionCreate', (evt)=> {
    console.log(evt.options.getUser('user'));
}); 

