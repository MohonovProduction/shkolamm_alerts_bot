const { Scenes, Markup } = require('telegraf')
const DataBase = require('./DataBase')

const Subscription = {}

Subscription.scene = new Scenes.BaseScene('SUBSCRIPTION')

Subscription.scene.enter(async ctx => {
    const chat_id = ctx.message.from.id

    const res = await DataBase.selectWhere(
        'chats',
        ['is_subscriber'],
        `chat_id = '${chat_id}'`
    )

    let parameter = res.rows[0].is_subscriber
    console.log('PARAMETER', parameter)

    const inlineKeyboard = [
        [Markup.button.callback(
            (!parameter) ? 'Подписаться' : 'Отписаться',
            `manage:${parameter}`
        )]
    ]

    ctx.reply(
        `Подписка ${(parameter) ? '💖 активна' : '😔 неактивна'}`,
        {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        }
    )
})

Subscription.scene.action(/manage/, ctx => {
    const parameter = !(ctx.update.callback_query.data.split(':')[1] === 'true')
    console.log('PARAMETER 2', parameter)
    const chat_id = ctx.update.callback_query.from.id

    DataBase.update('chats', 'is_subscriber', parameter, `chat_id = ${chat_id}`)
        .then(res => {
            const text = (parameter) ? 'Подписка теперь активна 🥳' : 'Подписка теперь неактивна 😔'
            ctx.editMessageText(text)
        })
        .catch(err => {
            console.log(err)
            ctx.editMessageText('Произошла ошибка')
        })
})

module.exports = Subscription
