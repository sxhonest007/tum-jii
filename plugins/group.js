const fs = require('fs-extra');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'group_settings.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ antibot: [], antibadword: [] }));

module.exports = {
    command: 'group',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const isOwner = msg.key.fromMe;
        const action = args[0]?.toLowerCase();
        const text = args.slice(1).join(' ');

        try {
            if (action === 'leave' && isOwner) {
                await socket.sendMessage(from, { text: "Bye-bye! It was fun while it lasted. ✨" });
                return await socket.groupLeave(from);
            }

            if (action === 'creategroup' && isOwner) {
                if (!text) return socket.sendMessage(from, { text: "I need a name for the new group, Boss! 🎀" });
                const group = await socket.groupCreate(text, [msg.key.participant]);
                return socket.sendMessage(from, { text: `Group *${text}* created successfully! 🪄` });
            }

            // Safety toggles for Antibot/Antibadword
            if (['antibot', 'antibadword'].includes(action)) {
                const db = JSON.parse(fs.readFileSync(dbPath));
                if (db[action].includes(from)) {
                    db[action] = db[action].filter(id => id !== from);
                    socket.sendMessage(from, { text: `${action} is now **OFF**. 🔓` });
                } else {
                    db[action].push(from);
                    socket.sendMessage(from, { text: `${action} is now **ON**. 🛡️` });
                }
                fs.writeFileSync(dbPath, JSON.stringify(db));
            }
        } catch (e) {
            socket.sendMessage(from, { text: "I couldn't complete that group action. ⚡" });
        }
    },

    handleMessage: async (socket, msg) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant;
        if (!from.endsWith('@g.us') || msg.key.fromMe) return;

        const db = JSON.parse(fs.readFileSync(dbPath));
        const body = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").toLowerCase();

        // 1. ANTIBOT (Kicks if a message comes from another bot ID)
        if (db.antibot.includes(from) && (sender.includes('1313') || sender.includes('447'))) {
             await socket.groupParticipantsUpdate(from, [sender], "remove");
             await socket.sendMessage(from, { text: "No other bots allowed in my territory! 💅" });
        }

        // 2. ANTIBADWORD (Basic filter)
        const badwords = ['spam', 'scam', 'shutup']; // Add your specific words here
        if (db.antibadword.includes(from) && badwords.some(word => body.includes(word))) {
            await socket.sendMessage(from, { delete: msg.key });
            await socket.sendMessage(from, { text: `Watch your language, @${sender.split('@')[0]}! 🌸`, mentions: [sender] });
        }
    }
};
