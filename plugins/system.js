const os = require('os');

module.exports = {
    command: 'system',
    execute: async (socket, msg, args) => {
        const from = msg.key.remoteJid;
        
        // Calculate Uptime
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);

        // Memory Usage
        const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

        const sysInfo = `*NATTY XMD - CORE SPECS* 🖥️\n\n` +
                        `✨ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n` +
                        `🧠 *RAM Usage:* ${usedMemory} MB\n` +
                        `📦 *Total RAM:* ${totalMemory} GB\n` +
                        `🛰️ *Platform:* ${os.platform()}\n` +
                        `👑 *Owner:* Malvin XD\n\n` +
                        `> "Power is nothing without control." 🎀`;

        await socket.sendMessage(from, { 
            text: sysInfo,
            contextInfo: {
                externalAdReply: {
                    title: "NATTY SYSTEM MONITOR",
                    body: `RAM: ${usedMemory}MB / UP: ${hours}h`,
                    mediaType: 1,
                    thumbnailUrl: 'https://i.pinimg.com/originals/e0/80/7e/e0807e6005d5395a02ecf04b2b23a54a.jpg',
                    sourceUrl: "https://whatsapp.com/channel/0029Vb7ti7m9RZAW7APm7U29",
                }
            }
        }, { quoted: msg });
    }
};
