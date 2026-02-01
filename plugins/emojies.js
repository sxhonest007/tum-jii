module.exports = {
    handleMessage: async (socket, msg) => {
        if (msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const body = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").toLowerCase();

        // Friendly Action Logic
        const reactions = [
            { keywords: ['hi', 'hello', 'hey', 'yo'], emoji: '👋' },
            { keywords: ['love', 'cute', 'heart', 'ily'], emoji: '💖' },
            { keywords: ['lol', 'lmao', 'haha', '😂'], emoji: '✨' },
            { keywords: ['wow', 'omg', 'cool'], emoji: '🪄' },
            { keywords: ['goodnight', 'gn', 'sleep'], emoji: '😴' },
            { keywords: ['sorry', 'sad', 'cry'], emoji: '🥺' },
            { keywords: ['thanks', 'thank you', 'ty'], emoji: '🌸' }
        ];

        for (const reaction of reactions) {
            if (reaction.keywords.some(word => body.includes(word))) {
                await socket.sendMessage(from, { 
                    react: { text: reaction.emoji, key: msg.key } 
                });
                break; 
            }
        }
    }
};
