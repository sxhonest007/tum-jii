const fs = require('fs');
const path = require('path');
const config = require('../config');

module.exports = {
    command: 'help',
    description: 'Displays the full list of available commands.',
    execute: async (socket, m, args, { prefix, isDev, isPremium }) => {
        const pluginsPath = path.join(process.cwd(), 'plugins');
        const pluginFiles = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.js'));
        
        let helpText = `*NATTY XMD COMMAND PANEL* 🎀\n\n`;
        helpText += `👤 *User:* @${m.sender.split('@')[0]}\n`;
        helpText += `👑 *Rank:* ${isDev ? 'Developer' : isPremium ? 'Premium' : 'Free User'}\n`;
        helpText += `📌 *Prefix:* [ ${prefix} ]\n`;
        helpText += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Organize commands into a list
        let commandsList = [];
        
        for (const file of pluginFiles) {
            const plugin = require(path.join(pluginsPath, file));
            if (plugin.command) {
                // If the plugin is dev-only, mark it
                const lock = plugin.isDev ? '🔒' : plugin.isPremium ? '💎' : '✨';
                commandsList.push(`${lock} *${prefix}${plugin.command}*`);
            }
        }

        if (commandsList.length === 0) {
            helpText += `_No commands found in the plugins folder._`;
        } else {
            helpText += commandsList.join('\n');
        }

        helpText += `\n\n━━━━━━━━━━━━━━━━━━━━\n`;
        helpText += `💡 *Tip:* Use ${prefix}menu for the visual dashboard.\n`;
        helpText += `📢 *Official Channel:* ${config.CHANNEL_LINK}`;

        const animeImages = [
            'https://i.pinimg.com/originals/db/6b/9f/db6b9f8753232049d97f6c38b2f9f8e4.jpg',
            'https://i.pinimg.com/originals/e0/80/7e/e0807e6005d5395a02ecf04b2b23a54a.jpg'
        ];
        const img = animeImages[Math.floor(Math.random() * animeImages.length)];

        await socket.sendMessage(m.chat, {
            image: { url: img },
            caption: helpText,
            mentions: [m.sender],
            contextInfo: {
                externalAdReply: {
                    title: "NATTY XMD HELP CENTER",
                    body: "Auto-Generated Command List",
                    mediaType: 1,
                    thumbnailUrl: img,
                    sourceUrl: config.CHANNEL_LINK,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
};
