const { Telegraf, session, Scenes } = require('telegraf')
const Config = require('./config.js')

const Administrator = require('./models/Administrator.js')
const CreatePost = require('./models/CreatePost.js')
const EditChats = require('./models/EditChats.js')

const User = require('./models/User.js')
const DataBase = require('./models/DataBase.js')
require('dotenv').config()

const Stage = new Scenes.Stage()
Stage.register(Administrator.scene)
Stage.register(CreatePost.scene)
Stage.register(EditChats.scene)

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)
bot.use(session()).use(Stage.middleware())

bot.telegram.setMyCommands(Config.commands, {})

bot.start(async ctx => {
    console.log(ctx.from)

    DataBase.addChat(ctx.from.id, ctx.from.first_name, 'user')
        .then(res => console.log('ADD USER', res))
        .catch(err => console.log('ADD USER ERR', err))

    await ctx.reply('<code>remove keyboard</code>', {
        parse_mode: 'HTML',
        reply_markup: {
            remove_keyboard: true
        }
    })
    const id = ctx.message.from.id
    if (Config.administrators.indexOf(id) !== -1) {
        ctx.scene.enter('ADMINISTRATION')
    } else {
        ctx.scene.enter('USER')
    }
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
