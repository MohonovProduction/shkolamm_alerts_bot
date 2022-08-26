const { Client } = require('pg')
require('dotenv').config()

// const { Sequelize, DataTypes } = require('sequelize')
// //const pg = require('pg')
//
// const sequelize = new Sequelize(
//     process.env.PGDATABASE,
//     process.env.PGUSER,
//     process.env.PGPASSWORD,
//     {
//         host: process.env.PGHOST,
//         dialect: 'postgres'
//     }
// )
//
// const queryInterface = sequelize.getQueryInterface()
//
// try {
//     sequelize.authenticate()
//         .then(data => console.log(data))
// } catch (error) {
//     console.error('Unable to connect to the database:', error);
// }

const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
})

client.connect().then(data => console.log('ok')).catch(err=> console.log(err))

const DataBase = {}

DataBase.select = async function(table, columns) {
    return new Promise((resolve, reject) => {
        let query = 'SELECT'
        if (columns === '*') {
            query += ` * FROM ${table}`
        } else {
            query += ` ${columns[0]}`
            for (let i = 1; columns.length > i; i++) query += `, ${columns[i]}`
            query += ` FROM ${table};`
        }
        console.log(query)
        client.query(query)
            .then(data => resolve(data))
            .catch(err => reject(err))
    })
}

DataBase.selectWhere = async function(table, columns, condition) {
    return new Promise((resolve, reject) => {
        let query = 'SELECT'
        if (columns === '*') {
            query += ` * FROM ${table}`
        } else {
            query += ` ${columns[0]}`
            for (let i = 1; columns.length > i; i++) query += `, ${columns[i]}`
            query += ` FROM ${table};`
        }
        query += ` WHERE ${condition}`

        console.log('QUERY', query)

        client.query(query)
            .then(data => resolve(data))
            .catch(err => reject(err))
    })
}

DataBase.addChat = async function(chat_id, chat_title, chat_type) {
    return new Promise(((resolve, reject) => {
        let query = `INSERT INTO chats (chat_id, chat_title, chat_type, is_subscriber)`
        query += `VALUES (${chat_id}, '${chat_title}', '${chat_type}', true)`
        console.log(query)
        client.query(query)
            .then(data => resolve(data))
            .catch(err => reject(err))
    }))
}

DataBase.addTeacher = async function(teacher_id, teacher_username, teacher_name) {
    return new Promise(((resolve, reject) => {
        let query = `INSERT INTO teachers (teacher_id, teacher_username, teacher_name)`
        query += ` VALUES (${teacher_id}, '${teacher_username}', '${teacher_name}');`
        console.log(query)
        client.query(query)
            .then(data => resolve(data))
            .catch(err => reject(err))
    }))
}

DataBase.addPost = async function(post) {
    return new Promise(((resolve, reject) => {
        let query = `INSERT INTO posts (post)`
        query += ` VALUES ('${JSON.stringify(post)}');`
        console.log(query)
        client.query(query)
            .then(data => resolve(data))
            .catch(err => reject(err))
    }))
}

DataBase.update = async function(table_name, column, value, condition) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE ${table_name} SET ${column} = ${value} WHERE ${condition}`
        client.query(query)
            .then(data => resolve(data))
            .catch(err => reject(err))
    })
}

DataBase.delete = async function(table_name, column, value) {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM ${table_name} WHERE ${column} = ${value}`
        client.query(query)
            .then(data => resolve(data))
            .catch(err => reject(err))
    })
}

module.exports = DataBase
