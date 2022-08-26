const { Scenes, Markup } = require('telegraf')
const DataBase = require('./DataBase')

const User = {}

User.scene = new Scenes.BaseScene('USER')

User.scene.enter(ctx => {

})

User.scene.leave(ctx => {
    
})

module.exports = User
