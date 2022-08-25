const { Scenes, Markup } = require('telegraf')
const DataBase = require('./DataBase')

const EditChats = {}

EditChats.scene = new Scenes.BaseScene('EDIT_CHATS')

module.exports = EditChats
