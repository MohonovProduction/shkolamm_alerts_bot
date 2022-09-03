const { Telegraf, session, Scenes } = require('telegraf')
const Config = require('./config.js')

const Posts = require('./models/Posts.js')
const Chats = require('./models/Chats.js')
const Subscription = require('./models/Subscription.js')

const DataBase = require('./models/DataBase.js')
require('dotenv').config({ path: "./.env" })

console.log(process.env)

const Stage = new Scenes.Stage()
Stage.register(Posts.scene)
Stage.register(Chats.scene)
Stage.register(Subscription.scene)

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

    if (Config.administrators.includes(id)) {
        ctx.reply(`Привет ${id} ☺\n\n💖 Подписка активна\n\/subscription - управление подпиской\n\n\/chats - управление чатами (удалить, узнать как добавить)\n\n\/posts - управление постами (добавить, отложить, просмотреть оложенные)`)
    } else {
        ctx.reply('Привет ☺\n\n💖 Подписка активна\n\/subscription - управление подпиской')
    }
})

bot.command('chats', ctx => {
    if (Config.administrators.includes(ctx.update.message.from.id))
        ctx.scene.enter('CHATS')
})

bot.command('posts', ctx => {
    if (Config.administrators.includes(ctx.update.message.from.id))
        ctx.scene.enter('POSTS')
})

bot.command('subscription', ctx => ctx.scene.enter('SUBSCRIPTION'))

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

bot.launch()
