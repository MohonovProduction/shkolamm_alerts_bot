const { Scenes, Markup } = require('telegraf')
const DataBase = require('./DataBase')

const Administrator = {}

Administrator.scene = new Scenes.BaseScene('ADMINISTRATION')

Administrator.scene.enter(ctx => {
    ctx.reply('🏠 Главная', new Markup.inlineKeyboard([
        [{ text: '💬 Список чатов', callback_data: 'chats' }],
        [{ text: '📝 Список постов', callback_data: 'posts' }],
    ]))
})

Administrator.scene.action('home', ctx => {
    ctx.editMessageText('🏠 Главная', new Markup.inlineKeyboard([
        [{ text: '💬 Список чатов', callback_data: 'chats' }],
        [{ text: '📝 Список постов', callback_data: 'posts' }],
    ]))
})

Administrator.scene.action('chats', ctx => {
    ctx.scene.enter('CHATS')
})

Administrator.scene.action('posts', ctx => {
    ctx.scene.enter('CREATE_POST')
})

Administrator.scene.leave()

module.exports = Administrator
