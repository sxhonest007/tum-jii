module.exports = {
    command: 'compliment',
    execute: async (socket, msg, args) => {
        const compliments = ["You're looking sharp today!", "Is it hot in here or is it just your profile pic?", "You're the best admin this group ever had."];
        const random = compliments[Math.floor(Math.random() * compliments.length)];
        await socket.sendMessage(msg.key.remoteJid, { text: `Hey! ${random} 😉` });
    }
};
