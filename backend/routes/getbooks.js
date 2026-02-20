const express = require('express')
const getBooks = express.Router()
const pool = require('../db')
const axios = require('axios')

getBooks.get('/', async(req, res) =>{
    let client
    try {
        client = await pool.connect()

        const search = req.query.search;
        let result;
        let query;
        if (search) {
            query = 'SELECT * FROM books.book WHERE book.isbn13 IS NOT NULL AND book.title ILIKE $1 LIMIT 10';
            result = await client.query(query, [`%${search}%`])
        } else {
            query = 'select * from books.book where book.isbn13 is not null limit 10'
            result = await client.query(query)
        }
        const books = result.rows
        // const additionalInfo = await Promise.all(books.map(async (book) => {
        //     try{
        //         const googleRes = await axios.get(
        //             `https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn13}`
        //         );

        //         const volumeInfo = googleRes.data.items?.[0]?.volumeInfo;

        //         return {
        //             ...book,
        //             cover: volumeInfo?.imageLinks?.thumbnail || null,
        //             description: volumeInfo?.description || "No description available."
        //         }
        //     } catch(apiErr){
        //         return { ...book, cover: null, description: "Error fetching description" }
        //     }
        // }))
        res.json(books)
    } catch(err) {
        console.error(err)
    } finally {
        client.release()
    }
})

module.exports = getBooks