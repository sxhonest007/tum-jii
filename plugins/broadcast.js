module.exports = {
    command: 'bc',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        
        // Owner Check (Replace with your number if not set in config)
        const isOwner = msg.key.fromMe; 
        if (!isOwner) return socket.sendMessage(from, { text: "Nice try, but only my boss can make me shout like this. 💋" });

        const type = args[0]?.toLowerCase();
        const text = args.slice(1).join(' ');

        if (!type || !text) {
            return socket.sendMessage(from, { text: `*Natty Broadcast* 📢\n\nUsage:\n${prefix}bc groups [msg]\n${prefix}bc chats [msg]` });
        }

        const getGroups = await socket.groupFetchAllParticipating();
        const groups = Object.values(getGroups).map(v => v.id);
        const chats = (await socket.chats.all()).map(c => c.id);

        try {
            if (type === 'groups' || type === 'gc') {
                await socket.sendMessage(from, { text: `Sending broadcast to ${groups.length} groups... ✨` });
                for (let i of groups) {
                    await delay(1500); // Small delay to prevent ban
                    await socket.sendMessage(i, { text: `*📢 NATTY BROADCAST*\n\n${text}\n\n> Sent by Owner 👑` });
                }
                await socket.sendMessage(from, { text: "Broadcast complete, darling. Everyone heard you! 💋" });
            } else if (type === 'chats' || type === 'pc') {
                await socket.sendMessage(from, { text: `Sending broadcast to all chats... 🪄` });
                for (let i of chats) {
                    await delay(1500);
                    await socket.sendMessage(i, { text: `*✨ MESSAGE FROM OWNER*\n\n${text}` });
                }
                await socket.sendMessage(from, { text: "Private broadcast delivered! 😘" });
            }
        } catch (e) {
            await socket.sendMessage(from, { text: "Ouch, something went wrong with the speakers! ⚡" });
        }
    }
};
