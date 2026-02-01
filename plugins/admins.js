module.exports = {
    command: 'admin',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        if (!isGroup) return socket.sendMessage(from, { text: "Honey, let's save the group magic for the groups. 😉" });

        const metadata = await socket.groupMetadata(from);
        const sender = msg.key.participant || msg.key.remoteJid;
        const botNumber = socket.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Permissions check
        const participants = metadata.participants;
        const isSenderAdmin = participants.find(p => p.id === sender)?.admin !== null;
        const isBotAdmin = participants.find(p => p.id === botNumber)?.admin !== null;

        if (!isSenderAdmin) return socket.sendMessage(from, { text: "You're cute, but only admins can tell me what to do. 🎀" });
        if (!isBotAdmin) return socket.sendMessage(from, { text: "I'd love to help, but I need to be an admin first. Make me yours? 💋" });

        const action = args[0]?.toLowerCase();
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ? msg.message.extendedTextMessage.contextInfo.participant : null) ||
                     (args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        try {
            switch (action) {
                case 'kick':
                    if (!user) return socket.sendMessage(from, { text: "Tag someone to kick, darling. I can't guess! 😘" });
                    await socket.groupParticipantsUpdate(from, [user], "remove");
                    await socket.sendMessage(from, { text: "They're gone. Finally, some breathing room... 💋" });
                    break;

                case 'add':
                    if (!user) return socket.sendMessage(from, { text: "Who are we inviting? Give me a number or tag. ✨" });
                    await socket.groupParticipantsUpdate(from, [user], "add");
                    await socket.sendMessage(from, { text: "New guest! I'll make sure they behave. 😉" });
                    break;

                case 'promote':
                    if (!user) return socket.sendMessage(from, { text: "Who's getting a promotion? Tag them! 👑" });
                    await socket.groupParticipantsUpdate(from, [user], "promote");
                    await socket.sendMessage(from, { text: "Congrats! You've got power now. Don't let it go to your head. ✨" });
                    break;

                case 'demote':
                    if (!user) return socket.sendMessage(from, { text: "Ouch, who are we stripping of power? ⚡" });
                    await socket.groupParticipantsUpdate(from, [user], "demote");
                    await socket.sendMessage(from, { text: "Back to the basics for you. I still like you though! 😘" });
                    break;

                case 'mute':
                    await socket.groupSettingUpdate(from, 'announcement');
                    await socket.sendMessage(from, { text: "Quiet time! Only admins talk while I'm watching. 🤫🎀" });
                    break;

                case 'unmute':
                    await socket.groupSettingUpdate(from, 'not_announcement');
                    await socket.sendMessage(from, { text: "Alright, you can all speak now. Be nice! ✨" });
                    break;

                case 'listonline':
                    const online = participants.filter(p => p.id).map(p => `@${p.id.split('@')[0]}`);
                    await socket.sendMessage(from, { 
                        text: `*Active Souls in ${metadata.subject}* ✨\n\n${online.join('\n')}\n\n> Always watching... 😉`,
                        mentions: participants.map(p => p.id)
                    });
                    break;

                default:
                    await socket.sendMessage(from, { text: `*Natty Admin Guide* 🛡️\n\n${prefix}kick\n${prefix}add\n${prefix}promote\n${prefix}demote\n${prefix}mute\n${prefix}unmute\n${prefix}listonline` });
            }
        } catch (e) {
            await socket.sendMessage(from, { text: "Something went wrong. Even I have bad days! ⚡" });
        }
    }
};
