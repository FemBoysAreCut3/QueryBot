const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel]
});

require('./modules/backupSystem.js')(client, config);
require('./modules/antiAbuse.js')(client, config);

client.once('ready', () => {
    console.log('=========================================');
    console.log(`[ONLINE] QueryBot online: ${client.user.tag}`);
    console.log('=========================================');
});

client.login(config.token);
