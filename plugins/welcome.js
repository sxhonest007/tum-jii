const fs = require('fs-extra');
const path = require('path');

// Database path for welcome messages
const dbPath = path.join(process.cwd(), 'database', 'welcome.json');
if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath));
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

module.exports = {
    command: 'setwelcome',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return socket.sendMessage(from, { text: "Darling, this is for groups only! 💋" });

        // Admin Check
        const metadata = await socket.groupMetadata(from);
        const isAdmin = metadata.participants.find(p => p.id === (msg.key.participant || msg.key.remoteJid))?.admin !== null;
        if (!isAdmin) return socket.sendMessage(from, { text: "Only admins get to tell me how to greet guests. 🎀" });

        const welcomeText = args.join(' ');
        if (!welcomeText) return socket.sendMessage(from, { text: `Usage: ${prefix}setwelcome Welcome @user to @group! Stay spicy! 🔥` });

        const db = JSON.parse(fs.readFileSync(dbPath));
        db[from] = welcomeText;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        await socket.sendMessage(from, { text: "Got it! I'll greet the new hotties with that message from now on. 😉✨" });
    },

    // Logic to handle when a new person joins
    onGroupUpdate: async (socket, update) => {
        const { id, participants, action } = update;
        if (action !== 'add') return;

        const db = JSON.parse(fs.readFileSync(dbPath));
        const welcomeMsg = db[id] || "Welcome @user to @group! Glad you're here. ✨";
        const metadata = await socket.groupMetadata(id);

        for (const user of participants) {
            const finalMsg = welcomeMsg
                .replace('@user', `@${user.split('@')[0]}`)
                .replace('@group', metadata.subject);

            await socket.sendMessage(id, {
                text: finalMsg,
                mentions: [user]
            });
        }
    }
};
