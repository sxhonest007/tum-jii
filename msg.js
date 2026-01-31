const {
    proto,
    generateForwardMessageContent,
    downloadContentFromMessage,
    getContentType
} = require('@whiskeysockets/baileys')
const fs = require('fs-extra')

const downloadMediaMessage = async (m, filename) => {
    let msg = m.msg || m
    let type = m.type || getContentType(m)
    
    if (type === 'viewOnceMessageV2' || type === 'viewOnceMessage') {
        msg = msg.message[getContentType(msg.message)]
        type = getContentType(m.message[type].message)
    }

    const stream = await downloadContentFromMessage(msg, type.replace('Message', ''))
    let buffer = Buffer.from([])
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }

    if (filename) {
        const mapping = { 
            imageMessage: '.jpg', 
            videoMessage: '.mp4', 
            audioMessage: '.mp3', 
            stickerMessage: '.webp', 
            documentMessage: '.pdf' 
        }
        const ext = mapping[type] || '.bin'
        await fs.writeFile(filename + ext, buffer)
        return filename + ext
    }
    return buffer
}

const sms = (conn, m) => {
    if (!m) return m
    if (m.key) {
        m.id = m.key.id
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = conn.decodeJid(m.fromMe ? conn.user.id : m.isGroup ? m.key.participant : m.key.remoteJid)
    }

    if (m.message) {
        m.type = getContentType(m.message)
        m.msg = (m.type === 'viewOnceMessageV2' || m.type === 'viewOnceMessage') 
            ? m.message[m.type].message[getContentType(m.message[m.type].message)] 
            : m.message[m.type]
        
        if (m.msg) {
            let context = m.msg?.contextInfo
            m.mentionedJid = context?.mentionedJid || []
            m.quoted = context?.quotedMessage ? context.quotedMessage : null
            
            m.body = m.message.conversation || m.msg.text || m.msg.caption || 
                     (m.type === 'listResponseMessage' && m.msg.singleSelectReply.selectedRowId) || 
                     (m.type === 'buttonsResponseMessage' && m.msg.selectedButtonId) || ''

            if (m.quoted) {
                m.quoted.type = getContentType(m.quoted)
                m.quoted.msg = m.quoted[m.quoted.type]
                m.quoted.id = context.stanzaId
                m.quoted.sender = conn.decodeJid(context.participant)
                m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id)
                m.quoted.download = (filename) => downloadMediaMessage(m.quoted, filename)
                m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
                    key: { remoteJid: m.chat, fromMe: m.quoted.fromMe, id: m.quoted.id, participant: m.quoted.sender },
                    message: m.quoted
                })
            }
        }
    }

    m.forward = async (jid, forceForward = false) => {
        let vtype = getContentType(m.message)
        let content = generateForwardMessageContent(m, forceForward)
        let contentType = getContentType(content)
        let context = vtype !== "conversation" ? m.message[vtype].contextInfo : {}
        content[contentType].contextInfo = { ...context, ...content[contentType].contextInfo }
        const waMessage = proto.WebMessageInfo.fromObject({
            key: { fromMe: m.fromMe, remoteJid: jid, id: m.id },
            message: content
        })
        await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
        return waMessage
    }

    m.reply = (text) => conn.sendMessage(m.chat, { text, mentions: [m.sender] }, { quoted: m })
    m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })

    return m
}

module.exports = { sms, downloadMediaMessage }
