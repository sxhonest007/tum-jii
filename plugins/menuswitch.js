const fs = require('fs-extra');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'settings.json');

module.exports = {
    command: 'menuswitch',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const isOwner = msg.key.fromMe;
        if (!isOwner) return socket.sendMessage(from, { text: "Only my developer can change my clothes! 👗" });

        const choice = args[0]?.toLowerCase();
        const validTypes = ['button', 'slide', 'normal'];

        if (!choice || !validTypes.includes(choice)) {
            return socket.sendMessage(from, { 
                text: `*MENU STYLE SWITCHER* 🪄\n\nUsage: \`${prefix}menuswitch [type]\`\n\n*Types available:*\n1. \`button\` (Interactive List)\n2. \`slide\` (Image Carousel)\n3. \`normal\` (Aesthetic Text)` 
            });
        }

        let settings = JSON.parse(fs.readFileSync(dbPath));
        settings.menuType = choice;
        fs.writeFileSync(dbPath, JSON.stringify(settings, null, 2));

        await socket.sendMessage(from, { 
            text: `Successfully switched to **${choice}** mode! Try \`${prefix}menu\` to see the magic. ✨` 
        });
    }
};
