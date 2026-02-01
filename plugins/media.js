const axios = require('axios');

module.exports = {
    command: 'play',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const query = args.join(' ');

        if (!query) return socket.sendMessage(from, { text: "What are we listening to today, honey? Give me a song name! 🎶" });

        await socket.sendMessage(from, { text: `Searching for *${query}*... 🪄` }, { quoted: msg });

        try {
            // Search for the video first
            const searchRes = await axios.get(`https://api.maher-zubair.tech/search/ytsearch?q=${encodeURIComponent(query)}`);
            const video = searchRes.data.result[0];
            const url = video.url;

            // Fetch download links (using a stable public API)
            const downloadRes = await axios.get(`https://api.maher-zubair.tech/download/ytmp3?url=${encodeURIComponent(url)}`);
            const audioUrl = downloadRes.data.result.link;

            await socket.sendMessage(from, { 
                audio: { url: audioUrl }, 
                mimetype: 'audio/mp4', 
                ptt: false 
            }, { quoted: msg });

            await socket.sendMessage(from, { text: `Enjoy your music! 💋\n\n*Title:* ${video.title}\n*Channel:* ${video.channelName}` });
        } catch (e) {
            await socket.sendMessage(from, { text: "I couldn't grab that track for you. Maybe try another title? ⚡" });
        }
    }
};
