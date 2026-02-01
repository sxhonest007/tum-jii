const axios = require('axios');

module.exports = {
    command: 'downloader',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const action = args[0]?.toLowerCase();
        const url = args[1];

        if (!action || !url) {
            return socket.sendMessage(from, { 
                text: `*NATTY DOWNLOADER HUB* 📥\n\n*Usage:* ${prefix}dl [site] [url]\n*Sites:* yt, tiktok, ig, fb, snap\n\n_Example: ${prefix}dl yt https://youtube.com/..._` 
            });
        }

        await socket.sendMessage(from, { text: `Fetching your media, hang tight... 🪄` }, { quoted: msg });

        // API Fallback List (Primary -> Backup)
        const apis = [
            `https://api.maher-zubair.tech/download/`,
            `https://api.botcahx.live/api/dowloader/`,
            `https://api.giftedtech.my.id/api/download/`
        ];

        try {
            let data = null;
            let success = false;

            // Loop through fallbacks
            for (let apiBase of apis) {
                try {
                    let endpoint = "";
                    if (action === 'yt') endpoint = `${apiBase}ytmp4?url=${encodeURIComponent(url)}`;
                    else if (action === 'tiktok') endpoint = `${apiBase}tiktok?url=${encodeURIComponent(url)}`;
                    else if (action === 'ig') endpoint = `${apiBase}instagram?url=${encodeURIComponent(url)}`;
                    else if (action === 'fb') endpoint = `${apiBase}facebook?url=${encodeURIComponent(url)}`;
                    else if (action === 'snap') endpoint = `${apiBase}snapchat?url=${encodeURIComponent(url)}`;

                    const res = await axios.get(endpoint);
                    if (res.data.status === 200 || res.data.result) {
                        data = res.data.result;
                        success = true;
                        break; // Exit loop if successful
                    }
                } catch (e) { continue; } // Try next API if current fails
            }

            if (!success || !data) throw new Error("All APIs failed");

            // Handle different result structures from various APIs
            const downloadUrl = data.url || data.video || data.link || data[0]?.url;
            const caption = `Downloaded via Natty Xmd ✨`;

            if (action === 'yt' || action === 'tiktok' || action === 'snap' || action === 'fb' || action === 'ig') {
                await socket.sendMessage(from, { 
                    video: { url: downloadUrl }, 
                    caption: caption 
                }, { quoted: msg });
            }

        } catch (err) {
            await socket.sendMessage(from, { text: "Ugh, all my download servers are acting up right now. Try again in a bit! ⚡" });
        }
    }
};
