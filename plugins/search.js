const axios = require('axios');

module.exports = {
    command: 'search',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const action = args[0]?.toLowerCase();
        const query = args.slice(1).join(' ');

        if (!action) return socket.sendMessage(from, { text: `*Natty Search* 🔍\n\n${prefix}search yt [query]\n${prefix}search weather [city]\n${prefix}search lyrics [song]` });

        try {
            if (action === 'yt') {
                const res = await axios.get(`https://api.maher-zubair.tech/search/ytsearch?q=${encodeURIComponent(query)}`);
                const vid = res.data.result[0];
                await socket.sendMessage(from, { 
                    image: { url: vid.thumbnail }, 
                    caption: `*${vid.title}*\n\n🔗 *Link:* ${vid.url}\n👀 *Views:* ${vid.views}` 
                }, { quoted: msg });
            } else if (action === 'weather') {
                const res = await axios.get(`https://api.maher-zubair.tech/details/weather?q=${encodeURIComponent(query)}`);
                const w = res.data.result;
                await socket.sendMessage(from, { text: `*Weather in ${query}* 🌤️\n\nTemp: ${w.temp}\nCondition: ${w.condition}\nHumidity: ${w.humidity}` });
            }
        } catch (e) {
            await socket.sendMessage(from, { text: "I couldn't find anything. Maybe you're looking for something that doesn't exist? 😉" });
        }
    }
};
