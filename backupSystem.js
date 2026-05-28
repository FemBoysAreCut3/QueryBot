const fs = require('fs');
const path = require('path');
const { Events } = require('discord.js');

const BACKUP_FILE = path.join(__dirname, '../backups.json');

function loadData() {
    if (!fs.existsSync(BACKUP_FILE)) return {};
    try { return JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8')); } catch (e) { return {}; }
}

function saveData(data) {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 4));
}

function backupMember(member, allBackups) {
    if (member.user.bot) return;
    allBackups[member.id] = {
        lastKnownTag: member.user.tag,
        nickname: member.nickname || null,
        roles: member.roles.cache
            .filter(role => role.name !== '@everyone' && !role.managed)
            .map(role => role.id),
        updatedAt: new Date().toISOString()
    };
}

module.exports = function(client, config) {
    client.once(Events.ClientReady, async () => {
        const guild = client.guilds.cache.get(config.guildId);
        if (!guild) return console.error("Backup-System: Server nicht gefunden!");

        let allBackups = loadData();
        try {
            const members = await guild.members.fetch();
            members.forEach(m => backupMember(m, allBackups));
            saveData(allBackups);
            console.log(`✅ Backup-System synchronisiert (${members.size} User).`);
        } catch (err) { console.error("Backup-Sync Fehler:", err); }
    });

    client.on(Events.GuildMemberUpdate, (oldM, newM) => {
        if (newM.guild.id !== config.guildId) return;
        let data = loadData();
        backupMember(newM, data);
        saveData(data);
    });

    client.on(Events.GuildMemberRemove, (m) => {
        if (m.guild.id !== config.guildId) return;
        let data = loadData();
        backupMember(m, data);
        saveData(data);
    });

    client.on(Events.GuildMemberAdd, async (member) => {
        if (member.guild.id !== config.guildId) return;
        const allBackups = loadData();
        const data = allBackups[member.id];
        if (!data) return;
        try {
            if (data.nickname) await member.setNickname(data.nickname);
            if (data.roles?.length > 0) await member.roles.add(data.roles);
            console.log(`Restore für: ${member.id}`);
        } catch (e) { console.log(`Teil-Restore für ${member.id}: ${e.message}`); }
    });
};