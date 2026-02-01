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

const config = require('./config');
const plugins = new Map();
const __path = process.cwd();

function loadPlugins() {
    const pluginsPath = path.join(__path, 'plugins');
    if (!fs.existsSync(pluginsPath)) fs.mkdirSync(pluginsPath);
    const pluginFiles = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.js'));
    for (const file of pluginFiles) {
        try {
            delete require.cache[require.resolve(path.join(pluginsPath, file))];
            const plugin = require(path.join(pluginsPath, file));
            if (plugin.command) plugins.set(plugin.command, plugin);
        } catch (e) { console.error(`Error loading ${file}:`, e); }
    }
}

async function EmpirePair(number, res) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const sessionPath = path.join(__path, 'session', `session_${sanitizedNumber}`);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const socket = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })) },
        printQRInTerminal: false,
        browser: Browsers.macOS('Safari'),
    });

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        const from = msg.key.remoteJid;
        const body = (getContentType(msg.message) === 'conversation') ? msg.message.conversation : 
                     (getContentType(msg.message) === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
        const prefix = config.PREFIX || '.';

        for (const p of plugins.values()) { if (p.handleMessage) await p.handleMessage(socket, msg); }

        if (body.startsWith(prefix)) {
            const args = body.slice(prefix.length).trim().split(/ +/);
            let cmd = args.shift().toLowerCase();

            // Mapping
            if (['gpt4', 'gpt', 'metaai', 'aipic'].includes(cmd)) { args.unshift(cmd); cmd = 'aitech'; }
            if (['sticker', 'vv', 'pin'].includes(cmd)) { args.unshift(cmd); cmd = 'content'; }
            if (['antibot', 'leave', 'creategroup'].includes(cmd)) { args.unshift(cmd); cmd = 'group'; }
            if (['truth', 'dare', 'ttt'].includes(cmd)) { args.unshift(cmd); cmd = 'games'; }

            if (plugins.has(cmd)) {
                try { await plugins.get(cmd).execute(socket, msg, args, { prefix }); }
                catch (err) { console.error(err); }
            } else if (cmd === 'menu') {
                const sections = [
                    {
                        title: "╭─「 𝐀𝐈 & 𝐓𝐄𝐂𝐇 」─╮",
                        rows: [{ title: "𝚐𝚙𝚝𝟺", rowId: `${prefix}gpt4` }, { title: "𝚊𝚒𝚙𝚒𝚌", rowId: `${prefix}aipic` }]
                    },
                    {
                        title: "╭─「 𝐂𝐎𝐍𝐓𝐄𝐍𝐓 」─╮",
                        rows: [{ title: "𝚜𝚝𝚒𝚌𝚔𝚎𝚛", rowId: `${prefix}sticker` }, { title: "𝚟𝚟", rowId: `${prefix}vv` }]
                    },
                    {
                        title: "╭─「 𝐆𝐑𝐎𝐔𝐏𝐄 」─╮",
                        rows: [{ title: "𝚊𝚗𝚝𝚒𝚋𝚘𝚝", rowId: `${prefix}antibot` }, { title: "𝚕𝚎𝚊𝚟𝚎", rowId: `${prefix}leave` }]
                    },
                    {
                        title: "╭─「 𝐆𝐀𝐌𝐄𝐒 」─╮",
                        rows: [{ title: "𝚝𝚛𝚞𝚝𝚑", rowId: `${prefix}truth` }, { title: "𝚍𝚊𝚛𝚎", rowId: `${prefix}dare` }]
                    }
                ];

                await socket.sendMessage(from, {
                    text: `*NATTY XMD* 🎀\nReady for fun?`,
                    buttonText: "Open Menu ✨",
                    sections
                }, { quoted: msg });
            }
        }
    });

    if (!socket.authState.creds.registered) {
        const code = await socket.requestPairingCode(sanitizedNumber);
        if (!res.headersSent) res.send({ code });
    }
}

router.get('/', async (req, res) => { if (req.query.number) await EmpirePair(req.query.number, res); });
loadPlugins();
module.exports = router;
