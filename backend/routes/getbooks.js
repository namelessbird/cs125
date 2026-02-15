const express = require('express')
const getBooks = express.Router()
const pool = require('../db')
const axios = require('axios')

getBooks.get('/', async(req, res) =>{
    let client
    try {
        client = await pool.connect()
        const query = 'select * from books.book limit 10'
        const result = await client.query(query)
        const books = result.rows
        const additionalInfo = await Promise.all(books.map(async (book) => {
            try{
                const googleRes = await axios.get(
                    `https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn13}`
                );

                const volumeInfo = googleRes.data.items?.[0]?.volumeInfo;

                return {
                    ...book,
                    cover: volumeInfo?.imageLinks?.thumbnail || null,
                    description: volumeInfo?.description || "No description available."
                }
            } catch(apiErr){
                return { ...book, cover: null, description: "Error fetching description" }
            }
        }))
        res.json(additionalInfo)
    } catch(err) {
        console.error(err)
    } finally {
        client.release()
    }
})

module.exports = getBooks