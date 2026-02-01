const fs = require('fs-extra');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'owners.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify(["263776404156@s.whatsapp.net"]));

module.exports = {
    command: 'owner',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Initial Owner Check
        const owners = JSON.parse(fs.readFileSync(dbPath));
        const isMainOwner = owners.includes(sender) || msg.key.fromMe;

        if (!isMainOwner) return socket.sendMessage(from, { text: "Only the original developer can add more owners. 👑" });

        const action = args[0]?.toLowerCase();
        const target = args[1]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        if (action === 'add' || action === 'addowner2') {
            if (!args[1]) return socket.sendMessage(from, { text: "Who are we promoting today? Give me a number. 🎀" });
            if (!owners.includes(target)) {
                owners.push(target);
                fs.writeFileSync(dbPath, JSON.stringify(owners));
                return socket.sendMessage(from, { text: `Successfully added @${target.split('@')[0]} as an owner! 🪄`, mentions: [target] });
            }
            return socket.sendMessage(from, { text: "They already have the crown, honey! 💅" });
        }

        await socket.sendMessage(from, { text: `*OWNER PANEL* 👑\n\nUse \`${prefix}owner add [number]\` to give someone full access.` });
    }
};
