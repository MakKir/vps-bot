module.exports = {

    logStart() {
        console.log('Started...')
    },
    getChatId(msg) {
        return msg.chat.id
    }
}
