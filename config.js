const Config = {}

Config.commands = [
    { command: '/subscription', description: 'управление подпиской' },
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

Config.botId = 2055969653 //5199739718

module.exports = Config
