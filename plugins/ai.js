const axios = require('axios');

module.exports = {
    command: 'ai',
    execute: async (socket, msg, args) => {
        const from = msg.key.remoteJid;
        const query = args.join(' ');

        if (!query) return socket.sendMessage(from, { text: "You can't just leave me hanging, darling! Ask me something. 💋" });

        try {
            // Using a free public AI endpoint
            const response = await axios.get(`https://api.maher-zubair.tech/ai/chatgpt?q=${encodeURIComponent(query)}`);
            const reply = response.data.result;

            await socket.sendMessage(from, { 
                text: `*Natty AI* ✨\n\n${reply}\n\n> Thinking about you... 😉` 
            }, { quoted: msg });
        } catch (e) {
            await socket.sendMessage(from, { text: "Ouch! My brain is a bit foggy right now. Try again in a second, love? ⚡" });
        }
    }
};
