const express = require('express')
const getBooks = express.Router()
const pool = require('../db')
const axios = require('axios')

getBooks.get('/', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const { search, userId } = req.query;

        const getEnrichedBooks = async (bookList) => {
            if (!bookList || bookList.length === 0) return [];
            return await Promise.all(bookList.map(async (book) => {
                try {
                    const googleRes = await axios.get(
                        `https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn13}`
                    );
                    const volumeInfo = googleRes.data.items?.[0]?.volumeInfo;
                    return {
                        ...book,
                        cover: volumeInfo?.imageLinks?.thumbnail || null,
                        description: volumeInfo?.description || book.description || "No description available."
                    };
                } catch (apiErr) {
                    return { ...book, cover: null };
                }
            }));
        };
        
        if (search && userId) {
            console.log(`Searching for: ${search} for User: ${userId}`)
            await client.query('INSERT INTO books.user_searches (user_id, search_str) VALUES ($1, $2)', [userId, search]);
            await client.query(`DELETE FROM books.user_searches WHERE search_id NOT IN (
                SELECT search_id FROM books.user_searches WHERE user_id = $1 ORDER BY searched_at DESC LIMIT 5
            ) AND user_id = $1`, [userId]);

            const result = await client.query(
                'SELECT * FROM books.book WHERE isbn13 IS NOT NULL AND title ILIKE $1 LIMIT 10', 
                [`%${search}%`]
            );
            
            console.log(`Found ${result.rows.length} books for search term "${search}"`);
            let searchResults = result.rows;

            // UNCOMMENT TO ENABLE API COVERS
            // searchResults = await getEnrichedBooks(searchResults);

            return res.json({ searchResults });

        } else {
            // A. Fetch Raw Database Rows
            const genRes = await client.query('SELECT * FROM books.book WHERE isbn13 IS NOT NULL ORDER BY avg_rating DESC LIMIT 10');
            const toReadRes = await client.query(`
                SELECT b.* FROM books.book b
                WHERE EXISTS (
                    -- Check if the author of the current book (b) 
                    -- matches any author from the user's preference list
                    SELECT 1 FROM books.book pref_books
                    WHERE pref_books.book_id IN (
                        SELECT UNNEST(book_ids) FROM books.user_preferences WHERE user_id = $1
                    )
                    AND b.authors ILIKE '%' || pref_books.authors || '%'
                )
                -- Exclude books already in their list
                AND b.book_id NOT IN (
                    SELECT UNNEST(book_ids) FROM books.user_preferences WHERE user_id = $1
                )
                LIMIT 5`, [userId])
            const recentSearchRes = await client.query(`
                WITH random_search AS (
                    SELECT search_str FROM books.user_searches WHERE user_id = $1 ORDER BY RANDOM() LIMIT 1
                )
                SELECT b.* FROM books.book b, random_search rs
                WHERE b.title ILIKE '%' || rs.search_str || '%' LIMIT 5`, [userId]);

            // Assign initial raw values
            let general = genRes.rows;
            let basedOnToRead = toReadRes.rows;
            let basedOnSearch = recentSearchRes.rows;

            // UNCOMMENT BELOW TO ENRICH WITH GOOGLE BOOKS API
            /*
            [general, basedOnToRead, basedOnSearch] = await Promise.all([
                getEnrichedBooks(general),
                getEnrichedBooks(basedOnToRead),
                getEnrichedBooks(basedOnSearch)
            ]);
            */

            res.json({ general, basedOnToRead, basedOnSearch });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    } finally {
        if (client) client.release();
    }
});

module.exports = getBooks