const Config = {}

const devMode = false

Config.commands = [
    { command: '/subscription', description: 'управление подпиской' },
]

Config.allChatCommands = Config.commands

Config.administratorsCommands = Config.commands.concat([
    { command: '/chats', description: 'чаты' },
    { command: '/posts', description: 'посты' }
])

if (devMode) {
    Config.administrators = [656626574]
} else {
    Config.administrators = [
        656626574,
        784434119,
        5033587882,
        116772776,
        5410541063
    ]
}

if (devMode) {
    Config.botId = 5199739718
} else {
    Config.botId = 2055969653
}

module.exports = Config
