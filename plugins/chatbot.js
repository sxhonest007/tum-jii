const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'chatbot.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

module.exports = {
    command: 'chatbot',
    execute: async (socket, msg, args) => {
        const from = msg.key.remoteJid;
        const status = args[0]?.toLowerCase();
        const db = JSON.parse(fs.readFileSync(dbPath));

        if (status === 'on') {
            db[from] = true;
            fs.writeFileSync(dbPath, JSON.stringify(db));
            return socket.sendMessage(from, { text: "Chatbot is **ON**. I'm all yours now, don't keep me waiting! 💋" });
        } else if (status === 'off') {
            db[from] = false;
            fs.writeFileSync(dbPath, JSON.stringify(db));
            return socket.sendMessage(from, { text: "Chatbot is **OFF**. I'll only speak when spoken to. 🎀" });
        }
        await socket.sendMessage(from, { text: "Use `.chatbot on` or `.chatbot off`" });
    },

    // This handles the auto-reply logic
    handleMessage: async (socket, msg) => {
        const from = msg.key.remoteJid;
        const db = JSON.parse(fs.readFileSync(dbPath));
        if (!db[from] || msg.key.fromMe) return;

        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
        if (!body || body.startsWith('.') || body.startsWith('!')) return;

        try {
            const res = await axios.get(`https://api.maher-zubair.tech/ai/chatgpt?q=${encodeURIComponent(body)}`);
            await socket.sendMessage(from, { text: res.data.result }, { quoted: msg });
        } catch (e) { /* Silent fail for chatbot */ }
    }
};
