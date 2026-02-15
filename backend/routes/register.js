const express = require('express')
const register = express.Router()
const bcrypt = require('bcrypt')
const pool = require('../db')
const saltRounds = 10

register.post('/', async (req, res) => {
    let client
    try {
        const { user, pass } = req.body
        //let sesh = req.session
        //sesh.loggedIn = false
        client = await pool.connect()
        let query = 'Select * From books.users as acc where acc.name = $1'
        const result = await client.query(query, [user])

        if (result.rowCount == 0) {
            const hashed = await bcrypt.hash(pass, saltRounds)
            query = 'Insert into books.users (name, password) Values ($1, $2)'
            await client.query(query, [user, hashed])
            console.log("added user")
            res.status(200).json({ message: "Successfully Signed Up"})
        } else {
            res.status(401).json({ message: "Username already in use" })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    } finally {
        client.release()
    }
})

module.exports = register