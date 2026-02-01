const axios = require('axios');

module.exports = {
    command: 'aitech',
    execute: async (socket, msg, args, { prefix }) => {
        const from = msg.key.remoteJid;
        const action = args[0]?.toLowerCase();
        const query = args.slice(1).join(' ');

        if (!action || !query) return socket.sendMessage(from, { text: "I need a query to work my tech magic, darling! ✨" });

        try {
            switch (action) {
                case 'gpt4':
                case 'gpt':
                case 'metaai':
                case 'codeai':
                    // Centralized AI handler with fallbacks
                    const aiEndpoints = [
                        `https://api.maher-zubair.tech/ai/chatgpt?q=${encodeURIComponent(query)}`,
                        `https://api.maher-zubair.tech/ai/photale?q=${encodeURIComponent(query)}`,
                        `https://api.maher-zubair.tech/ai/blackbox?q=${encodeURIComponent(query)}`
                    ];
                    
                    let response = null;
                    for (let url of aiEndpoints) {
                        try {
                            const res = await axios.get(url);
                            if (res.data.result || res.data.status === 200) {
                                response = res.data.result;
                                break;
                            }
                        } catch (e) { continue; }
                    }
                    await socket.sendMessage(from, { text: response || "My brain is a bit scrambled right now. Try again? ⚡" }, { quoted: msg });
                    break;

                case 'aipic':
                    const imgUrl = `https://api.maher-zubair.tech/ai/magicstudio?q=${encodeURIComponent(query)}`;
                    await socket.sendMessage(from, { image: { url: imgUrl }, caption: `Generated for you: ${query} 🪄` });
                    break;

                case 'npm':
                    const npmRes = await axios.get(`https://api.maher-zubair.tech/details/npm?q=${encodeURIComponent(query)}`);
                    const n = npmRes.data.result;
                    await socket.sendMessage(from, { text: `📦 *NPM PACKAGE*\n\nName: ${n.name}\nVersion: ${n.version}\nDesc: ${n.description}\nAuthor: ${n.author}` });
                    break;

                case 'github':
                    const gitRes = await axios.get(`https://api.maher-zubair.tech/details/github?q=${encodeURIComponent(query)}`);
                    const g = gitRes.data.result;
                    await socket.sendMessage(from, { 
                        image: { url: g.avatar }, 
                        caption: `🐙 *GITHUB USER*\n\nUsername: ${g.username}\nBio: ${g.bio}\nRepos: ${g.public_repos}\nFollowers: ${g.followers}` 
                    });
                    break;
            }
        } catch (e) {
            await socket.sendMessage(from, { text: "Something went wrong in the tech lab! ⚡" });
        }
    }
};
