const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const router = express.Router();
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

// --- DATABASE PATHS ---
const dbDir = path.join(__path, 'database');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);

const adminPath = path.join(dbDir, 'admin.json');
const settingsPath = path.join(dbDir, 'settings.json');
const premiumPath = path.join(dbDir, 'premium.json');

// Ensure DB files exist
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

async function EmpirePair(number, res) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__path, 'session', `session_${sanitizedNumber}`));

    const socket = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })) },
        printQRInTerminal: false,
        browser: Browsers.macOS('Desktop'),
        syncFullHistory: false,
        logger: pino({ level: 'fatal' })
    });

    // Handle multi-device JID decoding
    socket.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jid.split('@')[0].split(':')[0] + '@' + jid.split('@')[1];
            return decode;
        }
        return jid;
    };

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('messages.upsert', async ({ messages }) => {
        const rawMsg = messages[0];
        if (!rawMsg.message || rawMsg.key.remoteJid === 'status@broadcast') return;

        // Parse message with the updated msg.js logic
        const m = sms(socket, rawMsg);
        const prefix = config.PREFIX || '.';
        const body = m.body ? m.body.toLowerCase() : '';

        // --- DYNAMIC PERMISSIONS ---
        const admins = JSON.parse(fs.readFileSync(adminPath));
        const premiumData = JSON.parse(fs.readFileSync(premiumPath));
        
        const isDev = admins.developers.includes(m.sender) || m.sender === '923151105391@s.whatsapp.net';
        const isPremium = m.fromMe || isDev || premiumData.premium_users.some(u => u.id === m.sender);

        // --- COMMAND HANDLER ---
        if (body.startsWith(prefix) || body === '.natty' || body === '.menu') {
            const args = body.startsWith(prefix) ? m.body.slice(prefix.length).trim().split(/ +/) : ['menu'];
            let cmd = args.shift().toLowerCase();

            // Check Plugins
            if (plugins.has(cmd)) {
                try {
                    await plugins.get(cmd).execute(socket, m, args, { prefix, isDev, isPremium });
                } catch (err) { console.error(err); }
            } 
            
            // --- CORE NATTY MENU ---
            else if (cmd === 'menu' || cmd === 'natty') {
                const settings = JSON.parse(fs.readFileSync(settingsPath));
                const animeImages = [
                    'https://i.ibb.co/5hrtK2Lv/20251009-062614.jpg',
                    'https://i.ibb.co/5hrtK2Lv/20251009-062614.jpg',
                    'https://i.ibb.co/5hrtK2Lv/20251009-062614.jpg'
                ];
                const img = animeImages[Math.floor(Math.random() * animeImages.length)];
                
                const menuCaption = `*HEY QADEER AI IS HERE!* 😎\n\n` +
                    `👤 *User:* @${m.sender.split('@')[0]}\n` +
                    `👑 *Rank:* ${isDev ? 'Developer' : isPremium ? 'Premium' : 'Free User'}\n\n` +
                    `*Official Channel:* \nhttps://whatsapp.com/channel/0029Vb7lx2gEquiMB6IE550l\n\n` +
                    `╭─「 𝐒𝐘𝐒𝐓𝐄𝐌 」\n┃ ⤷ 𝚙𝚒𝚗𝚐\n┃ ⤷ 𝚜𝚢𝚜𝚝𝚎𝚖\n┃ ⤷ 𝚘𝚠𝚗𝚎𝚛\n╰────────\n\n` +
                    `╭─「 𝐀𝐈 & 𝐓𝐎𝐎𝐋𝐒 」\n┃ ⤷ 𝚐𝚙𝚝𝟺\n┃ ⤷ 𝚜𝚝𝚒𝚌𝚔𝚎𝚛\n┃ ⤷ 𝚏𝚘𝚛𝚠𝚊𝚛𝚍 (Owner)\n╰────────`;

                const options = {
                    image: { url: img },
                    caption: menuCaption,
                    mentions: [m.sender],
                    footer: "QADEER AI • Powered by Qadeer_Khan",
                    contextInfo: {
                        externalAdReply: {
                            title: "QADEER AI OFFICIAL",
                            body: "Powered by Qadeer Khan",
                            mediaType: 1,
                            thumbnailUrl: img,
                            sourceUrl: "https://whatsapp.com/channel/0029Vb7lx2gEquiMB6IE550l",
                            renderLargerThumbnail: true
                        }
                    }
                };

                // Apply Button Style if enabled
                if (settings.menuType === 'button') {
                    options.buttons = [
                        { buttonId: `${prefix}ping`, buttonText: { displayText: '⚡ Speed' }, type: 1 },
                        { buttonId: `${prefix}owner`, buttonText: { displayText: '👑 Owner' }, type: 1 }
                    ];
                    options.headerType = 4;
                }

                await socket.sendMessage(m.chat, options, { quoted: m });
            }
        }
    });

    // --- PAIRING CODE LOGIC ---
    if (!socket.authState.creds.registered) {
        await delay(1500);
        const code = await socket.requestPairingCode(sanitizedNumber);
        if (!res.headersSent) res.send({ code });
    }
}

router.get('/', async (req, res) => { 
    if (req.query.number) await EmpirePair(req.query.number, res); 
});

loadPlugins();
module.exports = router;
