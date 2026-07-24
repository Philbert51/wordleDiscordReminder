const dcJS = require('discord.js');
const cron = require('node-cron');
require('dotenv').config({ path: './botToken.env' });
const token = process.env.token;
const bot = new dcJS.Client({ intents: [1, 2, 512, 32768] });
let serverID = '781739449288491041';
let roleID = '1529803137131741345';
let adminRoleID = '786953137335828541';
let bestBoiRoleID = '1529393936165113998';

bot.login(token);


console.log(dcJS.AllowedMentionsTypes);
// const arr = ['2', '3'];
// console.log(arr.toString(), typeof arr.toString());


// bot.on('clientReady', async () => {
//     // const server = bot.guilds.cache.get(serverID);
//     // const role = server.roles.cache.get(roleID);
//     // console.log(role.members.keys());
//     // await refreshServer(serverID);
//     setInterval(() => {
//     console.log(bot.guilds.cache.get(serverID).roles.cache.get(roleID).members.keys())}, 
//     5000);
// });

// bot.on('guildMemberUpdate', () => {

// });

// async function refreshServer(serverID) {
//     const server = await bot.guilds.fetch(serverID);
//     await server.members.fetch();
//     await server.roles.fetch();
// }

// setInterval(() => {
//     const channel = bot.channels.cache.get('824499899306737674');//ssgn scores
//     const content = "";
    
//     channel.send()
// }, 5000);
