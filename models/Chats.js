const DataBase = require('./DataBase')
const { Scenes, Markup } = require('telegraf')

const Chats = {}

Chats.scene = new Scenes.BaseScene('CHATS')

Chats.scene.enter(async ctx => {
    ctx.session.now = 'all'

    const inlineKeyboard = await Chats.chatsKeyboard('all')

    ctx.reply(
        '💬 Список чатов',
        new Markup.inlineKeyboard(inlineKeyboard)
    )
})

Chats.scene.action(/chats/, async ctx => {
    const parameter = ctx.update.callback_query.data.split(':')[1]

    if (ctx.session.now === parameter) return
    ctx.session.now = parameter

    const inlineKeyboard = await Chats.chatsKeyboard(parameter)

    ctx.editMessageText(
        '💬 Список чатов',
        {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        }
    )
})

Chats.scene.action('close_scene', ctx => {
    ctx.scene.leave()
    ctx.deleteMessage()
})

Chats.scene.action(/chat/, async ctx => {
    const parameter = ctx.update.callback_query.data.split(':')[1]
    const now = ctx.session.now

    if (parameter.search('remove') !== -1) {
        const id = parameter.split('_')[1]
        DataBase.delete('chats', 'chat_id', id)
            .then(async res => {
                const inlineKeyboard = await Chats.chatsKeyboard(now)

                ctx.editMessageText(
                    '🏠 Главная / 💬 Список чатов',
                    {
                        reply_markup: {
                            inline_keyboard: inlineKeyboard
                        }
                    }
                )
            })
            .catch(err => console.log(err))
    }

    if (parameter.search('add') !== -1) {
        ctx.editMessageText(
            `Обычному пользователю нужно написать мне /start\n\nЕсли пользоваетль/канал/чат отписан, то он не будет отображаться в списке\n\nПросто добавь меня в чат или канал (в канал нужно отправить одно любоее собщение, чтобы я его запомнил) 😏`,
            {
                reply_markup: {
                    inline_keyboard: [[Markup.button.callback('Назад', 'chats')]]
                }
            },
        )
    }
})

Chats.chatsKeyboard = async function(parameter) {
    let result = []

    if (parameter === 'all')
        result = await DataBase.selectWhere('chats', '*', 'is_subscriber = true')
    if (parameter === 'groups')
        result = await DataBase.selectWhere('chats', '*', `chat_type = 'supergroup' AND is_subscriber = true`)
    if (parameter === 'channels')
        result = await DataBase.selectWhere('chats', '*', `chat_type = 'channel' AND is_subscriber = true`)
    if (parameter === 'users')
        result = await DataBase.selectWhere('chats', '*', `chat_type = 'user' AND is_subscriber = true`)

    console.log(result)

    const chats = result.rows

    const inlineKeyboard = []

    inlineKeyboard.push([
        Markup.button.callback('💬 Чаты', `chats:groups`),
        Markup.button.callback('📢 Каналы', `chats:channels`),
        Markup.button.callback('🗿 Люди', `chats:users`),
        Markup.button.callback('💬 📢 🗿', `chats:all`),
    ])

    if (chats) {
        for (let chat of chats) {
            inlineKeyboard.push([
                Markup.button.callback(`${chat.chat_title}`, `chat:chat_:${chat.chat_id}`),
                Markup.button.callback('🗑', `chat:remove_${chat.chat_id}`)
            ])
        }
    } else {
        inlineKeyboard.push([Markup.button.callback('Чатов нет', 'chats_reload')])
    }

    inlineKeyboard.push([Markup.button.callback('➕ Добавить', 'chat:add')])
    inlineKeyboard.push([Markup.button.callback('🔙 Закрыть', 'close_scene')])

    return inlineKeyboard
}

module.exports = Chats
