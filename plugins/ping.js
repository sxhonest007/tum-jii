module.exports = {
    command: 'ping',
    execute: async (socket, msg, args) => {
        const from = msg.key.remoteJid;
        const start = Date.now();
        
        // Initial "Loading" reaction/message
        await socket.sendMessage(from, { text: "Checking my pulse... 💓" }, { quoted: msg });
        
        const end = Date.now();
        const latency = end - start;

        // Final result with a sleek design
        const pingMessage = {
            text: `*YOH! NATTY SPEED* ⚡\n\n` +
                  `🚀 *Latency:* ${latency}ms\n` +
                  `👑 *Status:* Running Smooth\n` +
                  `🎀 *Power:* 100%`,
            contextInfo: {
                externalAdReply: {
                    title: "NATTY XMD CONNECTIVITY",
                    body: `Speed: ${latency}ms`,
                    mediaType: 1,
                    thumbnailUrl: 'https://i.pinimg.com/originals/e0/80/7e/e0807e6005d5395a02ecf04b2b23a54a.jpg',
                    sourceUrl: "https://whatsapp.com/channel/0029Vb7ti7m9RZAW7APm7U29",
                }
            }
        };

        await socket.sendMessage(from, pingMessage, { quoted: msg });
    }
};
