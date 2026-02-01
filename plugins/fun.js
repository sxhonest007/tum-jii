module.exports = {
    command: 'fun',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const action = args[0]?.toLowerCase();

        const truths = [
            "Who was the last person you searched on Instagram?",
            "What is your biggest secret?",
            "Have you ever lied to stay out of trouble?",
            "What is the most embarrassing thing in your room?"
        ];

        const dares = [
            "Send a voice note singing your favorite song.",
            "Text your crush and tell them they're cute.",
            "Change your WhatsApp bio to 'I am a potato' for 1 hour.",
            "Send a screenshot of your recent search history."
        ];

        try {
            switch (action) {
                case 'truth':
                    const randomTruth = truths[Math.floor(Math.random() * truths.length)];
                    await socket.sendMessage(from, { text: `✨ *Truth:* ${randomTruth}` }, { quoted: msg });
                    break;

                case 'dare':
                    const randomDare = dares[Math.floor(Math.random() * dares.length)];
                    await socket.sendMessage(from, { text: `🔥 *Dare:* ${randomDare}` }, { quoted: msg });
                    break;

                case 'match':
                    if (!from.endsWith('@g.us')) return socket.sendMessage(from, { text: "This is a group game, love! 😉" });
                    const metadata = await socket.groupMetadata(from);
                    const participants = metadata.participants;
                    const user1 = participants[Math.floor(Math.random() * participants.length)].id;
                    const user2 = participants[Math.floor(Math.random() * participants.length)].id;
                    
                    const percent = Math.floor(Math.random() * 100);
                    let comment = percent > 75 ? "A match made in heaven! 💖" : percent > 40 ? "There's a spark here... ✨" : "Maybe just friends? ☕";

                    await socket.sendMessage(from, { 
                        text: `*Couple Matchmaker* 💘\n\n👤 @${user1.split('@')[0]}\n👤 @${user2.split('@')[0]}\n\n💓 *Compatibility:* ${percent}%\n> ${comment}`,
                        mentions: [user1, user2]
                    }, { quoted: msg });
                    break;

                default:
                    await socket.sendMessage(from, { text: `*Natty Fun Zone* 🎡\n\n${prefix}fun truth\n${prefix}fun dare\n${prefix}fun match` });
            }
        } catch (e) {
            console.error(e);
        }
    }
};
