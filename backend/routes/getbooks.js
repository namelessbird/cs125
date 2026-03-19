const express = require("express");
const getBooks = express.Router();
const pool = require("../db");
const axios = require("axios");

getBooks.get("/", async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { search, userId } = req.query;

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const fetchWithRetry = async (url, retries = 3) => {
      try {
        return await axios.get(url, { timeout: 3000 });
      } catch (err) {
        if (err.response?.status === 429 && retries > 0) {
          const delay = (4 - retries) * 1000;
          await sleep(delay);
          return fetchWithRetry(url, retries - 1);
        }
        throw err;
      }
    };

    const getEnrichedBooks = async (bookList) => {
      const enrichedResults = [];
      for (const book of bookList) {
        let enrichedData = {
          ...book,
          cover: null,
          description: "No description available.",
        };

        try {
          // skip if already enriched
          if (book.cover && book.description) {
            enrichedResults.push(book);
            continue;
          }

          await sleep(500);

          const res = await fetchWithRetry(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn13}&key=${process.env.GOOGLE_BOOKS_API_KEY}`,
          );

          const info = res.data.items?.[0]?.volumeInfo;

          if (info) {
            enrichedData.cover =
              info.imageLinks?.thumbnail?.replace("http://", "https://") ||
              null;
            enrichedData.description =
              info.description || enrichedData.description;
          }
        } catch (err) {
          console.error(`Skipping ${book.isbn13}`);
        }

        enrichedResults.push(enrichedData);
      }

      return enrichedResults;
    };

    if (search && userId) {
      console.log(`Searching for: ${search} for User: ${userId}`);
      await client.query(
        "INSERT INTO books.user_searches (user_id, search_str) VALUES ($1, $2)",
        [userId, search],
      );
      await client.query(
        `DELETE FROM books.user_searches WHERE search_id NOT IN (
                SELECT search_id FROM books.user_searches WHERE user_id = $1 ORDER BY searched_at DESC LIMIT 5
            ) AND user_id = $1`,
        [userId],
      );

      const result = await client.query(
        `
        SELECT *,
        (
            (rating_count::float / (rating_count + 1000)) * avg_rating +
            (1000.0 / (rating_count + 1000)) * (
            SELECT AVG(avg_rating) FROM books.book WHERE avg_rating IS NOT NULL
            )
        ) AS score
        FROM books.book
        WHERE isbn13 IS NOT NULL 
        AND title ILIKE $1
        ORDER BY score DESC
        LIMIT 10
        `,
        [`%${search}%`],
      );

      console.log(
        `Found ${result.rows.length} books for search term "${search}"`,
      );
      let searchResults = result.rows;

      // UNCOMMENT TO ENABLE API COVERS
      searchResults = await getEnrichedBooks(searchResults);

      return res.json({ searchResults });
    } else {
      // A. Fetch Raw Database Rows
      const genRes = await client.query(`
                SELECT *,
                (
                    (rating_count::float / (rating_count + 1000)) * avg_rating +
                    (1000.0 / (rating_count + 1000)) * (
                    SELECT AVG(avg_rating) FROM books.book WHERE avg_rating IS NOT NULL
                    )
                ) AS score
                FROM books.book
                WHERE isbn13 IS NOT NULL
                ORDER BY score DESC
                LIMIT 10
                `);
      const toReadRes = await client.query(
        `
  SELECT b.*,
  (
    (b.rating_count::float / (b.rating_count + 1000)) * b.avg_rating +
    (1000.0 / (b.rating_count + 1000)) * (
      SELECT AVG(avg_rating) FROM books.book WHERE avg_rating IS NOT NULL
    )
  ) AS score
  FROM books.book b
  WHERE EXISTS (
    SELECT 1 FROM books.book pref_books
    WHERE pref_books.book_id IN (
      SELECT UNNEST(book_ids) FROM books.user_preferences WHERE user_id = $1
    )
    AND b.authors ILIKE '%' || pref_books.authors || '%'
  )
  AND b.book_id NOT IN (
    SELECT UNNEST(book_ids) FROM books.user_preferences WHERE user_id = $1
  )
  ORDER BY score DESC
  LIMIT 5
  `,
        [userId],
      );
      const recentSearchRes = await client.query(
        `
            WITH random_search AS (
                SELECT search_str 
                FROM books.user_searches 
                WHERE user_id = $1 
                ORDER BY RANDOM() 
                LIMIT 1
            )
            SELECT b.*,
            (
                (b.rating_count::float / (b.rating_count + 1000)) * b.avg_rating +
                (1000.0 / (b.rating_count + 1000)) * (
                SELECT AVG(avg_rating) FROM books.book WHERE avg_rating IS NOT NULL
                )
            ) AS score
            FROM books.book b, random_search rs
            WHERE b.title ILIKE '%' || rs.search_str || '%'
            ORDER BY score DESC
            LIMIT 5
            `,
        [userId],
      );

      // Assign initial raw values
      let general = genRes.rows;
      let basedOnToRead = toReadRes.rows;
      let basedOnSearch = recentSearchRes.rows;

      // UNCOMMENT BELOW TO ENRICH WITH GOOGLE BOOKS API

      [general, basedOnToRead, basedOnSearch] = await Promise.all([
        getEnrichedBooks(general),
        getEnrichedBooks(basedOnToRead),
        getEnrichedBooks(basedOnSearch),
      ]);

      res.json({ general, basedOnToRead, basedOnSearch });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  } finally {
    if (client) client.release();
  }
});

module.exports = getBooks;
