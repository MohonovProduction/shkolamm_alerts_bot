const { Scenes, Markup } = require('telegraf')
const DataBase = require('./DataBase')

const CreatePost  = {}

CreatePost.scene = new Scenes.BaseScene('CREATE_POST')

CreatePost.scene.enter(ctx => {
    console.log(CreatePost.posts)

    const inlineKeyboard = CreatePost.keyboard(CreatePost.posts)

    ctx.editMessageText(
        '🏠 Главная / 📝 Список постов',
        {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        }
    )
})

CreatePost.scene.action('menu', ctx => {
    console.log(CreatePost.posts)

    const inlineKeyboard = CreatePost.keyboard(CreatePost.posts)

    ctx.editMessageText(
        '🏠 Главная / 📝 Список постов',
        {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        }
    )
})

CreatePost.scene.action(/view_post/, async ctx => {
    const parameter = ctx.update.callback_query.data.split(':')[1]

    await CreatePost.sendPost(ctx, CreatePost.posts[parameter], ctx.session.message.from.id)

    await ctx.reply(
        'Назад',
        {
            reply_markup: {
                inline_keyboard: [[Markup.button.callback('📝 Список постов', 'menu')]]
            }
        }
    )
})

CreatePost.scene.action(/cancel_send/, ctx => {
    const parameter = Number(ctx.update.callback_query.data.split(':')[1])

    CreatePost.posts.splice(parameter, 1)

    clearTimeout(CreatePost.posts[parameter].timeoutID)

    ctx.editMessageText(
        'Пост удалён',
        {
            reply_markup: {
                inline_keyboard: [[Markup.button.callback('📝 Список постов', 'menu')]]
            }
        }
    )
})

CreatePost.scene.action('home', ctx => {
    ctx.deleteMessage()
    ctx.scene.enter('ADMINISTRATION')
})

CreatePost.scene.action('add', ctx => {
    ctx.session.now  = 'message'
    ctx.session.post = {}

    const inlineKeyboard = [[Markup.button.callback('📝 Назад', 'menu')]]

    ctx.editMessageText(
        'Отправь мне то, что хочешь опубликовать',
        Markup.inlineKeyboard(inlineKeyboard)
    )
})

CreatePost.scene.on('message', async ctx => {
    console.log('SESSION NOW', ctx.session.now)
    console.log('MESSAGE', ctx.update.message)
    console.log('POST', ctx.session.post)

    if (ctx.session.now !== 'message') return

    const now  = ctx.session.now
    const message = ctx.update.message
    const post  = ctx.session.post

    if ('text' in message) {
        post.text = message.text
    }

    if ('photo' in message) {
        if (!('media' in post)) post.media = []

        post.media.push({
            type: 'photo',
            media: message.photo[message.photo.length - 1].file_id
        })
    }

    if ('video' in message) {
        if (!('media' in post)) post.media = []

        post.media.push({
            type: 'video',
            media: message.video.file_id
        })
    }

    if ('voice' in message) {
        post.voice = message.voice.file_id
    }

    if ('video_note' in message) {
        post.video_note = message.video_note.file_id
    }

    ctx.session.now = ''
    ctx.session.message = message

    await CreatePost.sendPost(ctx, ctx.session.post, message.from.id)
    await ctx.telegram.sendMessage(
        message.from.id,
        ' ⌨ ',
        {
            reply_markup: {
                inline_keyboard: CreatePost.editor.keyboard,
            }
        })
})

CreatePost.scene.action('add_media', ctx => {
    ctx.session.now = 'message'

    const inlineKeyboard = [[Markup.button.callback('📝 Назад', 'view_draft')]]

    ctx.editMessageText(
        `<b>Пришли мне</b>\nили 🗒 текст\nили 🖼 изображение\nили 📀 видео\nили ⏺ видео сообщение\nили ▶ аудио сообщение`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        }
    )
})

CreatePost.scene.action('view_draft', async ctx => {
    const message = ctx.session.message

    await CreatePost.sendPost(ctx, ctx.session.post, message.from.id)
    await ctx.telegram.sendMessage(
        message.from.id,
        ' ⌨ ',
        {
            reply_markup: {
                inline_keyboard: CreatePost.editor.keyboard,
            }
        })
})

CreatePost.scene.action('publication', ctx => {
    const inlineKeyboard = [
        [
            Markup.button.callback('📝 Назад', 'view_draft'),
            Markup.button.callback('💬 Выбрать чаты', 'select_chats:start')
        ]
    ]

    ctx.editMessageText(
        'Сообщение готово к публикации',
        {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        }
    )
})

CreatePost.scene.action(/select_chats/, async ctx => {
    const parameter = ctx.update.callback_query.data.split(':')[1]

    let chats = []

    let edited = 0

    if (parameter === 'start') {
        let res = await DataBase.select('chats', '*')
        chats = res.rows

        for (let el of chats) el.checked = false

        ctx.session.chats = res.rows

        edited++
    } else {
        chats = ctx.session.chats
    }

    const inlineKeyboard = []

    inlineKeyboard.push([
        Markup.button.callback('Выбрать все', 'select_chats:add_all'),
        Markup.button.callback('Убрать все', 'select_chats:remove_all')
    ])

    if (parameter === 'add_all') chats.forEach(el => {
        if (el.checked === false) edited++
        el.checked = true
    })

    if (parameter === 'remove_all') chats.forEach(el => {
        if (el.checked === true) edited++
        el.checked = false
    })

    if (parameter.search('change') !== -1) {
        const key = parameter.split('_')[1]
        chats[key].checked = !chats[key].checked
        edited++
    }

    if (edited === 0) return

    for (let id in chats) {
        const el = chats[id]
        console.log(el)
        const text = (chats[id].checked) ? `🔹 ${el.chat_title}` : el.chat_title
        inlineKeyboard.push([
            Markup.button.callback(
                 text,
                `select_chats:change_${id}`)
        ])
    }

    inlineKeyboard.push([
        Markup.button.callback('📝 Назад', 'view_draft'),
        Markup.button.callback('⏲ Отложить', 'set_timeout:start'),
        Markup.button.callback('📢 Опубликовать', 'send_verified'),
    ])

    ctx.editMessageText(
        'Выбери чаты или каналы для рассылки',
        {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        }
    )
})

CreatePost.scene.action(/add_chat/, ctx => {
    //TODO: add chats to session

    console.log(ctx.update.callback_query.message)

    const chat_id = ctx.update.callback_query.data.split(':')[1]

    const inlineKeyboard = ctx.update.callback_query.message.reply_markup.inline_keyboard

    for (let id in inlineKeyboard) {
        const el = inlineKeyboard[id][0]
        const el_id = el['callback_data'].split(':')[1]
        if (el_id === chat_id) {
            if (el.text.search(/🔹/) === -1) {
                inlineKeyboard[id][0].text = `🔹 ${el.text}`
                inlineKeyboard[id][0].callback_data = `${el.callback_data}:checked`
            } else {
                inlineKeyboard[id][0].text = el.text.replace('🔹 ', '')
                inlineKeyboard[id][0].callback_data = el.callback_data.replace(':checked', '')
            }
        }
    }

    ctx.editMessageText(
        'Выбери чаты или каналы для рассылки',
        {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        }
    )
})

CreatePost.scene.action(/set_timeout/, ctx => {
    console.log(ctx)

    const parameter = ctx.update.callback_query.data.split(':')[1]
    console.log(parameter)

    if (parameter === 'just') return

    if (parameter === 'start') ctx.session.time = new Date()

    let date = ctx.session.time

    if (parameter.search('_') !== -1) {
        const method = parameter.split('_')[0]
        const key = parameter.split('_')[1]

        console.log(method, key)

        let operation = (method === 'add') ? 1 : -1

        switch (key) {
            case 'hours':
                date.setHours(date.getHours() + operation)
                console.log(date.getHours() + operation)
                break
            case 'minutes':
                date.setMinutes(date.getMinutes() + operation)
                break
            case 'day':
                date.setDate(date.getDate() + operation)
                break
            case 'month':
                date.setMonth(date.getMonth() + operation)
                break
            case 'year':
                date.setFullYear(date.getFullYear() + operation)
                break
        }

        ctx.session.time = new Date(date)
        date = new Date(date)

        console.log('DATE', ctx.session.time)
    }

    const formattedDate = {}

    formattedDate.hours = `${date.getHours()} ч`
    formattedDate.minutes = `${date.getMinutes()} м`
    formattedDate.day = `${date.getDate()} ${date.toLocaleString('ru', { weekday: 'long' })}`
    formattedDate.month = date.toLocaleString('ru', { month: 'long' })
    formattedDate.year = `${date.getFullYear()} г`

    console.log(formattedDate)

    const inlineKeyboard = []

    for (let el in formattedDate) {
        inlineKeyboard.push([
            Markup.button.callback('-', `set_timeout:remove_${el}`),
            Markup.button.callback(`${formattedDate[el]}`, 'set_timeout:just'),
            Markup.button.callback('+', `set_timeout:add_${el}`),
        ])
    }

    inlineKeyboard.push([
        Markup.button.callback('📝 Назад', 'select_chats:start'),
        Markup.button.callback('⏲ Отложить', 'send:schedule')

    ])

    ctx.editMessageText(
        'Выбери дату и время',
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        }
    )
})

CreatePost.scene.action('send_verified', ctx => {
    const inlineKeyboard = [[
        Markup.button.callback('📝 Назад', 'publication'),
        Markup.button.callback('📢 Опубликовать', 'send:now')
    ]]

    ctx.editMessageText(
        'Точно хочешь опубликовать?',
        {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        }
    )
})

CreatePost.scene.action(/send/, async ctx => {
    const parameter = ctx.update.callback_query.data.split(':')[1]
    const posts = CreatePost.posts
    const post = ctx.session.post
    const post_id = CreatePost.posts.length

    const chats  = []
    ctx.session.chats.forEach(el => {
        if (el.checked) chats.push(el)
    })

    post.chats = chats

    const now = new Date()
    const timeout = (parameter === 'now') ? 1 : ctx.session.time.getTime() - now

    post.createTime = now
    post.sendTime = timeout

    DataBase.addPost(post)
        .then(res => console.log('ADD POST', res))
        .catch(err => console.log('ADD POST ERR', err))

    const inlineKeyboard = [
        [Markup.button.callback('📝 В меню', 'menu')]
    ]

    const timeoutID = setTimeout(
        (ctx, chats, post, posts, inlineKeyboard) => {
            console.log(chats)

            let sendTurn = 0

            for (let chat of chats) {
                console.log('CHAT', chat)

                setTimeout(
                    (ctx, chat, post) => {
                        CreatePost.sendPost(ctx, post, chat.chat_id)
                            .then(() => ctx.reply(`Сообщение отправлено в ${chat.chat_title}`))
                            .catch(err => ctx.reply(`${JSON.stringify(err)}`))
                    },
                    sendTurn * 3000,
                    ctx,
                    chat,
                    post,
                    )

                sendTurn++

                console.log(Date.now())
            }

            setTimeout(
                (ctx, inlineKeyboard) => {
                    posts.splice(post_id, 1)

                    ctx.reply(
                        'Сообщения отправлены',
                        {
                            reply_markup: {
                                inline_keyboard: inlineKeyboard
                            }
                        }
                    )
                },
                sendTurn * 3000,
                ctx,
                inlineKeyboard,
                post_id,
                posts,
            )
        },
        timeout,
        ctx,
        chats,
        post,
        posts,
        inlineKeyboard
    )

    post.time = ctx.session.time
    post.timeoutID = timeoutID

    CreatePost.posts.push(post)

    console.log('AFTER PUSH', CreatePost.posts)

    if (parameter === 'schedule') {
        ctx.editMessageText(
            'Сообщение отложено',
            {
                reply_markup: {
                    inline_keyboard: inlineKeyboard
                }
            }
        )
    }
})

CreatePost.posts = []

CreatePost.keyboard = function(posts) {
    const inlineKeyboard = []

    for (let id in posts) {
        const text = ('text' in posts[id]) ? posts[id].text : 'Нет текста'

        const title = text.split('').splice(0, 20).join('')

        const date = posts[id].time
        const dateText = `${date.getDate()}/${date.getMonth()} ${date.getHours()}:${date.getMinutes()}`

        inlineKeyboard.push([
            Markup.button.callback(`${title}`, `view_post:${id}`),
            Markup.button.callback(`${dateText}`, `date:${id}`),
            //Markup.button.callback(`✏`, `edit:${post.id}`),
            Markup.button.callback('🗑', `cancel_send:${id}`)
        ])
    }

    inlineKeyboard.push([Markup.button.callback('➕ Добавить', 'add')])
    inlineKeyboard.push([Markup.button.callback('🏠 Назад', 'home')])

    return inlineKeyboard
}

CreatePost.sendPost = async function(ctx, post, chat_id) {

    if ('media' in post) {
        await ctx.telegram.sendMediaGroup(chat_id, post.media)
    }

    if ('video_note' in post) {
        await ctx.telegram.sendVideoNote(chat_id, post.video_note)
    }

    if ('voice' in post) {
        await ctx.telegram.sendAudio(chat_id, post.voice)
    }

    if ('text' in post) {
        await ctx.telegram.sendMessage(chat_id, post.text)
    }
}

CreatePost.editor = {}

CreatePost.editor.keyboard = [
    [Markup.button.callback('Добавить 🗒 / 🖼 / 📀 / ⏺ / ▶', 'add_media')],
    //[Markup.button.callback('✏ Изменить текст', 'add')],
    [
        Markup.button.callback('🧹 Очистить', 'add'),
        Markup.button.callback('👀 Предпросмотр', 'view_draft')
    ],
    [
        Markup.button.callback('< Назад', 'menu'),
        Markup.button.callback('Далее >', 'publication')
    ]
]

module.exports = CreatePost
