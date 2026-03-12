const express = require('express')
const userPref = express.Router()
const axios = require('axios')
const pool = require('../db')

userPref.post('/', async (req, res) => {
    let client;
    try {
        const { length, preference, publication, userId, bookId } = req.body;
        client = await pool.connect();

        let result;
        if (bookId) {
            // Logic for appending a book to the array
            const query = `
                UPDATE books.user_preferences
                SET book_ids = CASE
                    WHEN NOT ($1 = ANY(book_ids))
                    THEN array_append(book_ids, $1)
                    ELSE book_ids
                END
                WHERE user_id = $2
                RETURNING *;`;
            result = await client.query(query, [bookId, userId]);
        } else {
            const query = `
                INSERT INTO books.user_preferences 
                (book_length, preference, publication_date, user_id)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    book_length = EXCLUDED.book_length,
                    preference = EXCLUDED.preference,
                    publication_date = EXCLUDED.publication_date
                RETURNING *;`;
            result = await client.query(query, [length, preference, publication, userId]);
        }

        console.log("Updated/Inserted row: ", result.rows[0]);

        res.status(200).json({
            message: "Successfully synchronized user preference",
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    } finally {
        if (client) client.release();
    }
});

module.exports = userPref