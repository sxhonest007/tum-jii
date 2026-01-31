const express = require('express');
const app = express(); // Router ki jagah App banaya
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    getContentType,
    makeCacheableSignalKeyStore,
    Browsers,
} = require('@whiskeysockets/baileys');

const { sms } = require('./msg');
const config = require('./config');
const plugins = new Map();
const __path = process.cwd();
const PORT = process.env.PORT || 8000;

// --- DB INITIALIZATION ---
const dbDir = path.join(__path, 'database');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
const adminPath = path.join(dbDir, 'admin.json');
const settingsPath = path.join(dbDir, 'settings.json');
const premiumPath = path.join(dbDir, 'premium.json');

if (!fs.existsSync(settingsPath)) fs.writeFileSync(settingsPath, JSON.stringify({ menuType: 'button' }));
if (!fs.existsSync(adminPath)) {
    fs.writeFileSync(adminPath, JSON.stringify({ developers: ["923151105391@s.whatsapp.net"] }, null, 2));
}
if (!fs.existsSync(premiumPath)) {
    fs.writeFileSync(premiumPath, JSON.stringify({ premium_users: [] }, null, 2));
}

// --- PLUGIN LOADER ---
function loadPlugins() {
    const pluginsPath = path.join(__path, 'plugins');
    if (!fs.existsSync(pluginsPath)) fs.mkdirSync(pluginsPath);
    const pluginFiles = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.js'));
    for (const file of pluginFiles) {
        try {
            const plugin = require(path.join(pluginsPath, file));
            if (plugin.command) plugins.set(plugin.command, plugin);
        } catch (e) { console.error(`| ❌ | Plugin Error: ${file}`); }
    }
}

// --- MAIN BOT FUNCTION ---
async function QadeerBot(number, res) {
    const sanitizedNumber = number ? number.replace(/[^0-9]/g, '') : config.OWNER_NUMBER;
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__path, 'session', `session_${sanitizedNumber}`));

    const socket = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })) },
        printQRInTerminal: false,
        browser: Browsers.macOS('Desktop'),
        syncFullHistory: false,
        logger: pino({ level: 'fatal' })
    });

    socket.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jid.split('@')[0].split(':')[0] + '@' + jid.split('@')[1];
            return decode;
        }
        return jid;
    };

    socket.ev.on('creds.update', saveCreds);

    // --- CONNECTION & AUTO-JOIN LOGIC ---
    socket.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('✅ QADEER AI LIVE');
            await delay(5000); // Wait for session to stabilize

            try {
                // Auto Join Support Group
                const groupInvite = "J9ZOfMMCTzSLMKkpj0rdOz";
                await socket.groupAcceptInvite(groupInvite);
                
                // Send Welcome & Channel link to the user
                const welcomeMsg = `*QADEER AI CONNECTED!* 🎀\n\n` +
                    `Successfully deployed by: ${config.OWNER_NAME}\n\n` +
                    `I have added you to the Support Group. Join the Channel for more updates below:\n\n` +
                    `*Channel:* ${config.CHANNEL_LINK}`;
                
                await socket.sendMessage(socket.user.id, { text: welcomeMsg });
            } catch (e) {
                console.log('| ⚠️ | Auto-Join/Welcome failed.');
            }
        }
    });

    socket.ev.on('messages.upsert', async ({ messages }) => {
        const rawMsg = messages[0];
        if (!rawMsg.message || rawMsg.key.remoteJid === 'status@broadcast') return;

        const m = sms(socket, rawMsg);
        const prefix = config.PREFIX || '.';
        const body = m.body ? m.body.toLowerCase() : '';

        // --- PERMISSIONS ---
        const admins = JSON.parse(fs.readFileSync(adminPath));
        const premiumData = JSON.parse(fs.readFileSync(premiumPath));
        const isDev = admins.developers.includes(m.sender) || m.sender === '923151105391@s.whatsapp.net';
        const isPremium = m.fromMe || isDev || premiumData.premium_users.some(u => u.id === m.sender);

        if (body.startsWith(prefix) || body === '.natty' || body === '.menu') {
            const args = body.startsWith(prefix) ? m.body.slice(prefix.length).trim().split(/ +/) : ['menu'];
            let cmd = args.shift().toLowerCase();

            if (plugins.has(cmd)) {
                try {
                    await plugins.get(cmd).execute(socket, m, args, { prefix, isDev, isPremium });
                } catch (err) { console.error(err); }
            } 
            else if (cmd === 'menu' || cmd === 'natty') {
                const settings = JSON.parse(fs.readFileSync(settingsPath));
                const animeImages = [
                    'https://i.ibb.co/5hrtK2Lv/20251009-062614.jpg',
                    'https://i.ibb.co/5hrtK2Lv/20251009-062614.jpg'
                ];
                const img = animeImages[Math.floor(Math.random() * animeImages.length)];
                
                const menuCaption = `*HEY QADEER AI IS HERE!* 😎\n\n` +
                    `👤 *User:* @${m.sender.split('@')[0]}\n` +
                    `👑 *Rank:* ${isDev ? 'Developer' : isPremium ? 'Premium' : 'Free User'}\n\n` +
                    `*Official Channel:* \n${config.CHANNEL_LINK}\n\n` +
                    `╭─「 𝐒𝐘𝐒𝐓𝐄𝐌 」\n┃ ⤷ 𝚙𝚒𝚗𝚐\n┃ ⤷ 𝚜𝚢𝚜𝚝𝚎𝚖\n┃ ⤷ 𝚘𝚠𝚗𝚎𝚛\n╰────────\n\n` +
                    `╭─「 𝐀𝐈 & 𝐓𝐎𝐎𝐋𝐒 」\n┃ ⤷ 𝚐𝚙𝚝𝟺\n┃ ⤷ 𝚜𝚝𝚒𝚌𝚔𝚎𝚛\n┃ ⤷ 𝚋𝚌 (Owner)\n╰────────`;

                const options = {
                    image: { url: img },
                    caption: menuCaption,
                    mentions: [m.sender],
                    footer: "QADEER AI • Qadeer Khan",
                    contextInfo: {
                        externalAdReply: {
                            title: "QADEER AI V2",
                            body: "Tap to join channel",
                            mediaType: 1,
                            thumbnailUrl: img,
                            sourceUrl: config.CHANNEL_LINK,
                            renderLargerThumbnail: true
                        }
                    }
                };

                if (settings.menuType === 'button') {
                    options.buttons = [
                        { buttonId: `${prefix}ping`, buttonText: { displayText: '⚡ Speed' }, type: 1 },
                        { buttonId: `${prefix}system`, buttonText: { displayText: '🖥️ System' }, type: 1 }
                    ];
                }

                await socket.sendMessage(m.chat, options, { quoted: m });
            }
        }
    });

    // --- PAIRING CODE LOGIC ---
    if (!socket.authState.creds.registered) {
        // Sirf tab code bhejo jab 'res' (response) available ho aur code manga gaya ho
        if (res) {
            await delay(1500);
            try {
                const code = await socket.requestPairingCode(sanitizedNumber);
                if (!res.headersSent) res.json({ code });
            } catch (e) {
                if (!res.headersSent) res.json({ error: 'Pairing Failed' });
            }
        }
    }
}

// --- SERVER ROUTES ---
app.use(express.json());

// 1. HTML Page Dikhane k liye
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// 2. Pairing Code Generate krne k liye
app.get('/code', async (req, res) => {
    if (req.query.number) {
        await QadeerBot(req.query.number, res);
    } else {
        res.json({ error: 'Number required' });
    }
});

// Start Server
loadPlugins();
app.listen(PORT, () => {
    console.log(`✅ QADEER AI Server Running on Port ${PORT}`);
});

module.exports = app;
