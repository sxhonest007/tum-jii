const fs = require('fs');
require('dotenv').config();

module.exports = {
    // --- BOT SETTINGS ---
    BOT_NAME: process.env.BOT_NAME || 'QADEER AI',
    PREFIX: process.env.PREFIX || '.',
    OWNER_NAME: process.env.OWNER_NAME || 'Qadeer_Khan',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '923151105391',
    
    // --- SESSION & DATABASE ---
    SESSION_ID: process.env.SESSION_ID || 'Qadeer_Session', // Name of your session folder
    DATABASE_URL: process.env.DATABASE_URL || './database/qadeer.db',
    
    // --- MENU & STYLING ---
    MENU_STYLE: process.env.MENU_STYLE || 'button', // Options: 'button', 'text', 'list'
    IMG_URL: 'https://i.ibb.co/5hrtK2Lv/20251009-062614.jpg',
    
    // --- SOCIAL LINKS ---
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029Vb7lx2gEquiMB6IE550l',
    GROUP_LINK: 'https://chat.whatsapp.com/J9ZOfMMCTzSLMKkpj0rdOz',
    
    // --- AUTO-STATUS & FEATURES ---
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS === 'true' || true,
    AUTO_BLOCK_PM: process.env.AUTO_BLOCK_PM === 'true' || false,
    REJECT_CALLS: process.env.REJECT_CALLS === 'true' || true,
};

// Auto-update notification for the console
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(`| ⚙️ | Config.js Updated!`);
    delete require.cache[file];
    require(file);
});
