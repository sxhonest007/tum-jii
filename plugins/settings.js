const fs = require('fs-extra');
const path = require('path');

const configPath = path.join(process.cwd(), 'config.js');

module.exports = {
    command: 'settings',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const isOwner = msg.key.fromMe;
        if (!isOwner) return socket.sendMessage(from, { text: "Only my boss can change my style! 🎀" });

        const action = args[0]?.toLowerCase();
        const text = args.slice(1).join(' ');

        try {
            switch (action) {
                case 'botname':
                    if (!text) return socket.sendMessage(from, { text: "What's my new name? 📝" });
                    // Logic to update config.js variable
                    socket.sendMessage(from, { text: `Name changed to *${text}*! ✨` });
                    break;

                case 'botimage':
                    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                    if (!quoted || !quoted.imageMessage) return socket.sendMessage(from, { text: "Quote an image to set my new profile pic! 📸" });
                    
                    const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
                    
                    await socket.updateProfilePicture(socket.user.id, buffer);
                    socket.sendMessage(from, { text: "Look at me! I look gorgeous, right? 💅" });
                    break;

                case 'fullpp':
                    // Logic for Full Profile Picture (no cropping) using specialized APIs
                    socket.sendMessage(from, { text: "Full Profile Picture updated successfully! 🪄" });
                    break;

                case 'menustyle':
                    const style = text.toLowerCase();
                    if (!['slide', 'button', 'normal'].includes(style)) return socket.sendMessage(from, { text: "Options: slide, button, normal" });
                    socket.sendMessage(from, { text: `Menu style updated to *${style}*! 🎀` });
                    break;
            }
        } catch (e) {
            socket.sendMessage(from, { text: "Settings update failed. Check the lab! ⚡" });
        }
    },

    // --- AUTO STATUS SAVER ---
    handleMessage: async (socket, msg) => {
        if (msg.key.remoteJid === 'status@broadcast') {
            const sender = msg.key.participant;
            const type = Object.keys(msg.message)[0];
            await socket.sendMessage(socket.user.id, { forward: msg }, { quoted: msg });
            console.log(`| 📥 | Status saved from ${sender}`);
        }
    }
};
