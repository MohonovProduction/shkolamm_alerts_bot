const DataBase = require('./DataBase')
const { Scenes, Markup } = require('telegraf')

const Chats = {}

Chats.scene = new Scenes.BaseScene('CHATS')

Chats.scene.enter(async ctx => {
    const parameter = ctx.update.callback_query.data.split(':')[1]

    const inlineKeyboard = await Chats.chatsKeyboard(parameter)

    inlineKeyboard.push([
        Markup.button.callback('💬 Чаты', 'chats:groups'),
        Markup.button.callback('📢 Каналы', 'chats:channels'),
        Markup.button.callback('🗿 Люди', 'chats:users'),
        Markup.button.callback('💬 📢 🗿', 'chats:all'),
    ])

    if (chats) {
        for (let chat of chats) {
            inlineKeyboard.push([
                Markup.button.callback(`${chat.chat_title}`, `chats_chat:${chat.chat_id}`),
                Markup.button.callback('🗑', `chats_remove:${chat.chat_id}`)
            ])
        }
    } else {
        inlineKeyboard.push([Markup.button.callback('🔄 Перезагрузить', 'chats_reload')])
    }

    inlineKeyboard.push([Markup.button.callback('➕ Добавить', 'chats_add')])
    inlineKeyboard.push([Markup.button.callback('🏠 Назад', 'home')])

    ctx.editMessageText(
        '🏠 Главная / 💬 Список чатов',
        new Markup.inlineKeyboard(inlineKeyboard)
    )
})

Administrator.scene.action(/chats/, async ctx => {

})

Administrator.scene.action('chats_add', ctx => {
    ctx.editMessageText(
        `Просто добавь меня в чат или канал (в канал нужно отправить одно любоее собщение, чтобы я его запомнил) 😏`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[Markup.button.callback('Назад', 'chats')]]
            }
        },
    )
})

Administrator.scene.action(/chats_remove/, ctx => {
    const chat_id = ctx.update.callback_query.data.split(':')[1]
    console.log(chat_id)
    DataBase.delete('chats', 'chat_id', chat_id)
        .then(data => {
            console.log(data)
            ctx.editMessageText(
                `Убрал ☺`,
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[Markup.button.callback('Назад', 'chats')]]
                    }
                },
            )
        })
        .catch(err => {
            console.log(err)
            ctx.editMessageText(
                `Произошла ошибка <pre>${err.code}</pre> 😔`,
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[Markup.button.callback('Назад', 'chats')]]
                    }
                },
            )
        })
})

Chats.chatsKeyboard = async function(parameter) {
    let result = []

    if (parameter === 'all')
        result = await DataBase.select('chats', '*')
    if (parameter === 'groups')
        result = await DataBase.selectWhere('chats', '*', `chat_type = 'supergroup'`)
    if (parameter === 'channels')
        result = await DataBase.selectWhere('chats', '*', `chat_type = 'channel'`)
    if (parameter === 'users')
        result = await DataBase.selectWhere('chats', '*', `chat_type = 'user'`)

    console.log(result)
    const chats = result.rows
    const inlineKeyboard = []

    if (chats) {
        for (let chat of chats) {
            inlineKeyboard.push([
                Markup.button.callback(`${chat.chat_title}`, `chats_chat:${chat.chat_id}`),
                Markup.button.callback('🗑', `chats_remove:${chat.chat_id}`)
            ])
        }
    } else {
        inlineKeyboard.push([Markup.button.callback('Чатов нет', 'chats_reload')])
    }

    return inlineKeyboard
}

module.exports = Chats
