const Config = {}

Config.commands = [
    //{ command: '/start', description: 'начать' },
    { command: '/subscribe', description: 'подписаться' },
    { command: '/unsubscribe', description: 'отписаться' }
]

Config.allChatCommands = Config.commands

Config.administratorsCommands = Config.commands.concat([
    { command: '/chats', description: 'чаты' },
    { command: '/posts', description: 'посты' }
])


Config.administrators = [
    656626574,
    784434119,
    5033587882,
]

Config.botId = 2055969653

module.exports = Config
