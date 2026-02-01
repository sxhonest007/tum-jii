const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    command: 'autos',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const action = args[0]?.toLowerCase();
        
        // Simple toggle for the chatbot logic
        if (action === 'on') {
            return socket.sendMessage(from, { text: "All systems are GO! I'm watching everything now. 😉✨" });
        }
        await socket.sendMessage(from, { text: `*Natty Automation* ⚡\nUse ${prefix}chatbot on/off to control the AI.` });
    },

    handleMessage: async (socket, msg) => {
        const from = msg.key.remoteJid;
        if (msg.key.fromMe) return;

        // 1. AUTO READ
        await socket.readMessages([msg.key]);

        // 2. AUTO TYPING
        await socket.sendPresenceUpdate('composing', from);

        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

        // 3. AUTO REACT (Reacts to every message with a cute emoji)
        const emojis = ['✨', '🎀', '🌸', '🪄', '⭐'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        await socket.sendMessage(from, { react: { text: randomEmoji, key: msg.key } });

        // 4. AUTO AUDIO CHATBOT (Triggered by keywords or randomly)
        // Note: Using a public voice API
        if (body.length > 2 && Math.random() > 0.7) { 
            const voiceUrl = `https://api.maher-zubair.tech/ai/elevenlab?q=${encodeURIComponent(body)}&voice=natty`; 
            await socket.sendMessage(from, { audio: { url: voiceUrl }, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
        }
    },

    // 5. AUTO STATUS VIEW/LIKE
    onStatus: async (socket, status) => {
        await socket.readMessages([status.key]);
        await socket.sendMessage(status.key.remoteJid, { react: { text: '🔥', key: status.key } }, { statusJidList: [status.key.participant] });
    }
};
