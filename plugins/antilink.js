const fs = require('fs-extra');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'antilink.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

module.exports = {
    command: 'antilink',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        if (!isGroup) return socket.sendMessage(from, { text: "Links only matter in groups, sugar. 😉" });

        const metadata = await socket.groupMetadata(from);
        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = metadata.participants.find(p => p.id === sender)?.admin !== null;

        if (!isAdmin) return socket.sendMessage(from, { text: "Nice try, but only admins can set the rules. 🎀" });

        const status = args[0]?.toLowerCase();
        const db = JSON.parse(fs.readFileSync(dbPath));

        if (status === 'on') {
            db[from] = true;
            fs.writeFileSync(dbPath, JSON.stringify(db));
            return socket.sendMessage(from, { text: "Antilink is **ON**. I'll kick anyone who tries to drop a link here. 💋" });
        } else if (status === 'off') {
            db[from] = false;
            fs.writeFileSync(dbPath, JSON.stringify(db));
            return socket.sendMessage(from, { text: "Antilink is **OFF**. The group is an open house now! ✨" });
        }
        await socket.sendMessage(from, { text: `Use \`${prefix}antilink on\` or \`off\`` });
    },

    handleMessage: async (socket, msg) => {
        const from = msg.key.remoteJid;
        const db = JSON.parse(fs.readFileSync(dbPath));
        if (!db[from] || msg.key.fromMe) return;

        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        const linkPattern = /chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;

        if (linkPattern.test(body)) {
            const metadata = await socket.groupMetadata(from);
            const sender = msg.key.participant;
            const isAdmin = metadata.participants.find(p => p.id === sender)?.admin !== null;

            if (!isAdmin) {
                await socket.sendMessage(from, { text: "No links allowed here, darling. Goodbye! 💅" });
                await socket.groupParticipantsUpdate(from, [sender], "remove");
                await socket.sendMessage(from, { delete: msg.key });
            }
        }
    }
};
