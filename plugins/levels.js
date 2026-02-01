const fs = require('fs-extra');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'levels.json');
if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath));
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

module.exports = {
    command: 'levels',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const user = msg.key.participant || msg.key.remoteJid;
        const db = JSON.parse(fs.readFileSync(dbPath));
        const action = args[0]?.toLowerCase();

        if (action === 'rank') {
            const stats = db[user] || { xp: 0, level: 1 };
            return socket.sendMessage(from, { 
                text: `*RANK CARD* 🏆\n\n👤 User: @${user.split('@')[0]}\n⭐ Level: ${stats.level}\n✨ XP: ${stats.xp}\n\nKeep chatting to level up! 💋`,
                mentions: [user]
            });
        }

        if (action === 'leaderboard') {
            const sorted = Object.entries(db)
                .sort(([, a], [, b]) => b.xp - a.xp)
                .slice(0, 5);
            let lb = `*NATTY TOP 5 ELITE* 👑\n\n`;
            sorted.forEach(([id, data], i) => {
                lb += `${i + 1}. @${id.split('@')[0]} - Lv.${data.level}\n`;
            });
            return socket.sendMessage(from, { text: lb, mentions: sorted.map(x => x[0]) });
        }

        await socket.sendMessage(from, { text: `*Leveling System*\n\n${prefix}levels rank\n${prefix}levels leaderboard` });
    },

    handleMessage: async (socket, msg) => {
        if (msg.key.fromMe || !msg.key.participant) return;
        const user = msg.key.participant;
        const db = JSON.parse(fs.readFileSync(dbPath));

        if (!db[user]) db[user] = { xp: 0, level: 1 };
        
        // Add XP for every message
        db[user].xp += Math.floor(Math.random() * 10) + 5;
        
        // Level up logic (Level = XP / 100)
        const newLevel = Math.floor(db[user].xp / 100) + 1;
        if (newLevel > db[user].level) {
            db[user].level = newLevel;
            await socket.sendMessage(msg.key.remoteJid, { 
                text: `🎉 *LEVEL UP!* @${user.split('@')[0]} is now Level ${newLevel}! So proud of you~ ✨`,
                mentions: [user]
            });
        }
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    }
};
