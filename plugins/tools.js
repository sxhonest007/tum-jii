const axios = require('axios');

module.exports = {
    command: 'tools',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const action = args[0]?.toLowerCase();
        const text = args.slice(1).join(' ');

        try {
            if (action === 'logo') {
                if (!text) return socket.sendMessage(from, { text: "Give me a name for the logo! 🎀" });
                const logoUrl = `https://api.maher-zubair.tech/maker/glowing-neon?text=${encodeURIComponent(text)}`;
                await socket.sendMessage(from, { image: { url: logoUrl }, caption: `Your neon logo, gorgeous! ✨` });
            } else if (action === 'define') {
                const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
                const def = res.data[0].meanings[0].definitions[0].definition;
                await socket.sendMessage(from, { text: `*Definition of ${text}:*\n\n${def}` });
            }
        } catch (e) {
            await socket.sendMessage(from, { text: "I couldn't process that tool. My bad! ⚡" });
        }
    }
};
