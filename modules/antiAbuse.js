const { EmbedBuilder, Events } = require('discord.js');

module.exports = function(client, config) {
    const userDeleteCounter = new Map();
    const lastMessageTimestamp = new Map();

    client.on(Events.MessageCreate, (message) => {
        if (message.author.bot) return;
        lastMessageTimestamp.set(message.author.id, Date.now());
    });

    client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
        if (newMessage.author.bot || !newMessage.guild || newMessage.guild.id !== config.guildId) return;
        if (!oldMessage.content || oldMessage.content === newMessage.content) return;

        const member = newMessage.member || await newMessage.guild.members.fetch(newMessage.author.id).catch(() => null);
        if (!member || !member.roles.cache.has(config.roles.target) || !member.moderatable) return;

        const oldWords = oldMessage.content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
        const newWords = newMessage.content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
        const ratio = oldWords.filter(word => newWords.includes(word)).length / oldWords.length;

        if (ratio < 0.5 && oldWords.length > 1) {
            const timeSinceSend = Date.now() - (lastMessageTimestamp.get(newMessage.author.id) || 0);
            if (timeSinceSend < 15000) {
                applyGlobalTimeout(newMessage, member, config, "System-Umgehung (Edit-Spam)");
            } else {
                revokeChannelAccess(newMessage, newMessage.author.id, config, "System-Umgehung (Nachrichten Editiert)");
            }
        }
    });

    client.on(Events.MessageDelete, async (message) => {
        if (!message.author || message.guild?.id !== config.guildId || message.author.bot) return;
        const member = message.member || await message.guild.members.fetch(message.author.id).catch(() => null);
        if (!member || !member.roles.cache.has(config.roles.target) || !member.moderatable) return;

        const userId = message.author.id;
        const count = (userDeleteCounter.get(userId) || 0) + 1;
        userDeleteCounter.set(userId, count);

        if (Date.now() - (lastMessageTimestamp.get(userId) || 0) < 10000) { 
            return applyGlobalTimeout(message, member, config, "Fast sofortiges Löschen");
        }

        if (count >= config.settings.deleteThreshold) {
            revokeChannelAccess(message, userId, config, "Massenlöschung");
        }

        setTimeout(() => { if (userDeleteCounter.get(userId) <= count) userDeleteCounter.delete(userId); }, 120000);
    });
};

async function revokeChannelAccess(message, userId, config, reason) {
    await message.channel.permissionOverwrites.edit(userId, { ViewChannel: false, SendMessages: false });
    const embed = new EmbedBuilder().setTitle('🚫 ZUGRIFF ENTZOGEN').setColor(0xFF0000).setDescription(`<@${userId}>: ${reason}`);
    await message.channel.send({ content: `<@&${config.roles.admin}>`, embeds: [embed] });
}

async function applyGlobalTimeout(message, member, config, reason) {
    await member.timeout(config.settings.timeoutDuration, reason);
    const embed = new EmbedBuilder().setTitle('🚨 TIMEOUT').setColor(0xFF0000).setDescription(`<@${member.id}>: ${reason}`);
    await message.channel.send({ content: `<@&${config.roles.admin}>`, embeds: [embed] });
}
