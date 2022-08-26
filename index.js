const { Telegraf, session, Scenes } = require('telegraf')
const Config = require('./config.js')

const Posts = require('./models/Posts.js')
const Chats = require('./models/Chats.js')
const User = require('./models/User.js')

const DataBase = require('./models/DataBase.js')
require('dotenv').config()

const Stage = new Scenes.Stage()
Stage.register(Posts.scene)
Stage.register(Chats.scene)

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)
bot.use(session()).use(Stage.middleware())

bot.telegram.setMyCommands(Config.commands)

Config.administrators.forEach(
    el => bot.telegram.setMyCommands(
        Config.administratorsCommands,
        { scope: { type: 'chat', chat_id: el } }
        )
)

bot.start(async ctx => {
    console.log(ctx.from)

    DataBase.addChat(ctx.from.id, ctx.from.first_name, 'user')
        .then(res => console.log('ADD USER', res))
        .catch(err => console.log('ADD USER ERR', err))

    const id = ctx.message.from.id
    if (Config.administrators.indexOf(id) !== -1) {
        ctx.reply('Administration reply')
    } else {
        ctx.reply('User reply')
    }
})

bot.command('chats', ctx => ctx.scene.enter('CHATS'))

bot.command('posts', ctx => ctx.scene.enter('POSTS'))

bot.command('subscribe', ctx => {
    console.log(ctx, ctx.message.from.id)

    const chat_id = ctx.message.from.id

    DataBase.update('chats', 'is_subscriber', true, `chat_id = ${chat_id}`)
        .then(res => console.log(res))
        .catch(err => console.log(err))
})

bot.command('unsubscribe', ctx => {

})

bot.on('new_chat_members', ctx => {
    console.log(ctx, ctx.update.message.chat, ctx.update.message.new_chat_members)

    const chat = ctx.update.message.chat
    const newMembers = ctx.update.message.new_chat_members

    let flag = false
    for (let member of newMembers) {
        console.log(member)
        if (member.id === Config.botId) {
            flag = true
            break
        }
    }

    if (flag) {
        DataBase.addChat(chat.id, chat.title, chat.type)
            .then(data => console.log(data))
            .catch(err => console.log(err))
    }
})

bot.on('channel_post', ctx => {
    console.log(ctx, ctx.update.channel_post.chat)

    const channel = ctx.update.channel_post.chat

    DataBase.addChat(channel.id, channel.title, channel.type)
        .then(data => console.log(data))
        .catch(err => console.log(err))
})

bot.settings( ctx => ctx.reply('settings') )

bot.launch()
