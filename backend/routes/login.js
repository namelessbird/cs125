const express = require('express')
const login = express.Router()
const bcrypt = require('bcrypt')
const pool = require('../db')
const saltRounds = 10

login.post('/', async (req, res) => {
    let client
    try {
        const { user, pass } = req.body
        //let sesh = req.session
        //sesh.loggedIn = false
        client = await pool.connect()
        let query = 'Select * From books.users as acc where acc.name = $1'
        const result = await client.query(query, [user])

        if (result.rowCount != 0) {
            foundUser = result.rows[0]
            const match = await bcrypt.compare(pass, foundUser.password)
            if (match){
                res.status(200).json({ message: "Successfully Signed Up"})
            }
            else {
                res.status(401).json({ message: "Invalid Credentials" })
            }
        } else {
            res.status(401).json({ message: "Invalid Credentials" })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    } finally {
        client.release()
    }
})

module.exports = login