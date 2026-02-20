const express = require('express')
const userPref = express.Router()
const axios = require('axios')
const pool = require('../db')

userPref.post('/', async (req, res) => {
    console.log("User pref route hit")
    let client
    try {
        const { length, preference, publication, userId } = req.body

        client = await pool.connect()
        let query = `INSERT INTO books.user_preferences 
            (book_length, preference, publication_date, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
            `
        const result = await client.query(query, [length, preference, publication, userId])
        console.log("Inserted row: ", result.rows[0])

        res.status(200).json({
            message: "Successfully inserted user preference"
        })
    } catch (err) {
        res.status(500).json({ message: "Server error" })
        console.log(err)
    } finally {
        client.release()
    }

})

module.exports = userPref