const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    command: 'content',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const action = args[0]?.toLowerCase();
        const query = args.slice(1).join(' ');

        try {
            switch (action) {
                case 'doraemon':
                    const dorRes = await axios.get(`https://api.maher-zubair.tech/search/google-img?q=doraemon+fanart`);
                    const dorImg = dorRes.data.result[Math.floor(Math.random() * dorRes.data.result.length)];
                    await socket.sendMessage(from, { image: { url: dorImg }, caption: "Here is your dose of 22nd-century magic! 🪄" });
                    break;

                case 'sticker':
                    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                    if (!quoted) return socket.sendMessage(from, { text: "Quote an image or video to make a sticker, darling! 🎀" });
                    // Logic for sticker conversion would typically use a library like fluent-ffmpeg or a web API
                    const sticUrl = `https://api.maher-zubair.tech/maker/sticker?url=${encodeURIComponent(query)}`; 
                    await socket.sendMessage(from, { sticker: { url: sticUrl } });
                    break;

                case 'pin':
                    if (!query) return socket.sendMessage(from, { text: "What should I find on Pinterest? 📍" });
                    const pinRes = await axios.get(`https://api.maher-zubair.tech/search/pinterest?q=${encodeURIComponent(query)}`);
                    const pinImg = pinRes.data.result[0];
                    await socket.sendMessage(from, { image: { url: pinImg }, caption: `Found this for you: ${query}` });
                    break;

                case 'vv':
                    const vvQuoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                    if (!vvQuoted) return socket.sendMessage(from, { text: "Tag a View Once message so I can peek at it! 😉" });
                    
                    const vvType = Object.keys(vvQuoted)[0];
                    const media = vvQuoted[vvType];
                    
                    if (media?.viewOnce) {
                        const stream = await downloadContentFromMessage(media, vvType.replace('Message', ''));
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

                        if (vvType === 'imageMessage') await socket.sendMessage(from, { image: buffer, caption: "Caught it! 📸" });
                        else if (vvType === 'videoMessage') await socket.sendMessage(from, { video: buffer, caption: "Saved it! 🎥" });
                        else if (vvType === 'audioMessage') await socket.sendMessage(from, { audio: buffer, mimetype: 'audio/mp4', ptt: false });
                    } else {
                        await socket.sendMessage(from, { text: "That's not a View Once message, sugar." });
                    }
                    break;
            }
        } catch (e) {
            console.error(e);
            await socket.sendMessage(from, { text: "I couldn't process that content request. ⚡" });
        }
    }
};
