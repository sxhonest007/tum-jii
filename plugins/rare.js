const axios = require('axios');

module.exports = {
    command: 'rare',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const action = args[0]?.toLowerCase();
        const text = args.slice(1).join(' ');

        try {
            switch (action) {
                case 'fancy':
                    if (!text) return socket.sendMessage(from, { text: "Give me some text to style, honey! ✨" });
                    const fancyRes = await axios.get(`https://api.maher-zubair.tech/tools/fonttxt?q=${encodeURIComponent(text)}`);
                    const fonts = fancyRes.data.result.map(f => f.result).slice(0, 10).join('\n\n');
                    await socket.sendMessage(from, { text: `*FANCY FONTS* 🎀\n\n${fonts}` });
                    break;

                case 'ssweb':
                    if (!text) return socket.sendMessage(from, { text: "I need a URL to take a snap! 📸" });
                    await socket.sendMessage(from, { image: { url: `https://api.maher-zubair.tech/tools/ssweb?url=${text}` }, caption: `Screenshot of ${text} ✨` });
                    break;

                case 'tempmail':
                    const mail = await axios.get(`https://api.maher-zubair.tech/tools/tempmail`);
                    await socket.sendMessage(from, { text: `*TEMP MAIL* 📧\n\nEmail: ${mail.data.result}\n\nUse this to stay anonymous!` });
                    break;

                case 'inspect':
                    if (!text.includes('whatsapp.com')) return socket.sendMessage(from, { text: "Send a valid group link, sugar. 🔗" });
                    const inviteCode = text.split('whatsapp.com/')[1];
                    const groupData = await socket.groupGetInviteInfo(inviteCode);
                    await socket.sendMessage(from, { text: `*GROUP INSPECTOR* 🕵️‍♀️\n\nName: ${groupData.subject}\nID: ${groupData.id}\nMembers: ${groupData.size}\nCreator: @${groupData.owner.split('@')[0]}`, mentions: [groupData.owner] });
                    break;

                case 'carbon':
                    if (!text) return socket.sendMessage(from, { text: "Paste your code here! 💻" });
                    await socket.sendMessage(from, { image: { url: `https://api.maher-zubair.tech/maker/carbon?text=${encodeURIComponent(text)}` }, caption: "Your code looks gorgeous now! 🪄" });
                    break;

                case 'readmore':
                    if (!text.includes('|')) return socket.sendMessage(from, { text: "Format: front | hidden_text" });
                    const [front, back] = text.split('|');
                    const readMore = String.fromCharCode(8206).repeat(4001);
                    await socket.sendMessage(from, { text: front + readMore + back });
                    break;
            }
        } catch (e) {
            await socket.sendMessage(from, { text: "Ouch! The lab is a bit messy right now. Try again later? ⚡" });
        }
    }
};
