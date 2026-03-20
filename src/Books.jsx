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
          if (book.cover && book.description) {
            enrichedResults.push(book);
            continue;
          }

          await sleep(500);

          const res = await fetchWithRetry(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn13}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
          );

          const info = res.data.items?.[0]?.volumeInfo;

          if (info) {
            enrichedData.cover =
              info.imageLinks?.thumbnail?.replace("http://", "https://") || null;
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
      // Track search
      await client.query(
        "INSERT INTO books.user_searches (user_id, search_str) VALUES ($1, $2)",
        [userId, search]
      );
      await client.query(
        `DELETE FROM books.user_searches WHERE search_id NOT IN (
          SELECT search_id FROM books.user_searches WHERE user_id = $1 ORDER BY searched_at DESC LIMIT 5
        ) AND user_id = $1`,
        [userId]
      );

      const result = await client.query(
        `
        SELECT *,
        (
          (rating_count::float / (rating_count + 1000)) * avg_rating +
          (1000.0 / (rating_count + 1000)) *
          (SELECT AVG(avg_rating) FROM books.book WHERE avg_rating IS NOT NULL)
        ) AS score
        FROM books.book
        WHERE isbn13 IS NOT NULL 
        AND title ILIKE $1
        ORDER BY score DESC
        LIMIT 10
        `,
        [`%${search}%`]
      );

      const searchResults = await getEnrichedBooks(result.rows);
      return res.json({ searchResults });
    } else if (userId) {
      // Fetch user's saved survey preferences
      const prefRes = await client.query(
        `SELECT * FROM books.user_preferences WHERE user_id = $1 ORDER BY preference_id DESC LIMIT 1`,
        [userId]
      );
      const userPref = prefRes.rows[0] || {};

      const conditions = ["isbn13 IS NOT NULL"];
      const values = [];
      let idx = 1;

      // Book length filter
      if (userPref.book_length === "Under 250 pages") {
        conditions.push(`pages IS NOT NULL AND pages < $${idx}`);
        values.push(250);
        idx++;
      } else if (userPref.book_length === "250-400 pages") {
        conditions.push(`pages IS NOT NULL AND pages BETWEEN $${idx} AND $${idx + 1}`);
        values.push(250, 400);
        idx += 2;
      } else if (userPref.book_length === "400-600 pages") {
        conditions.push(`pages IS NOT NULL AND pages BETWEEN $${idx} AND $${idx + 1}`);
        values.push(401, 600);
        idx += 2;
      } else if (userPref.book_length === "600+ pages") {
        conditions.push(`pages IS NOT NULL AND pages > $${idx}`);
        values.push(600);
        idx++;
      }

      // Publication date filter
      if (userPref.publication_date === "Classic (pre-1970)") {
        conditions.push(`EXTRACT(YEAR FROM publication_date) < $${idx}`);
        values.push(1970);
        idx++;
      } else if (userPref.publication_date === "1970-2000") {
        conditions.push(`EXTRACT(YEAR FROM publication_date) BETWEEN $${idx} AND $${idx + 1}`);
        values.push(1970, 2000);
        idx += 2;
      } else if (userPref.publication_date === "2000-2015") {
        conditions.push(`EXTRACT(YEAR FROM publication_date) BETWEEN $${idx} AND $${idx + 1}`);
        values.push(2000, 2014);
        idx += 2;
      } else if (userPref.publication_date === "Recent (2015+)") {
        conditions.push(`EXTRACT(YEAR FROM publication_date) >= $${idx}`);
        values.push(2015);
        idx++;
      }

      // Preference filter
      if (userPref.preference === "Critically acclaimed books") {
        conditions.push(`avg_rating >= 4.0`);
      } else if (userPref.preference === "Bestsellers") {
        conditions.push(`rating_count > 10000`);
      }

      // Main query
      const genRes = await client.query(
        `
        SELECT *,
        (
          (rating_count::float / (rating_count + 1000)) * avg_rating +
          (1000.0 / (rating_count + 1000)) *
          (SELECT AVG(avg_rating) FROM books.book WHERE avg_rating IS NOT NULL)
        ) AS score
        FROM books.book
        WHERE ${conditions.join(" AND ")}
        ORDER BY score DESC
        LIMIT 10
        `,
        values
      );

      const enriched = await getEnrichedBooks(genRes.rows);
      res.json({ general: enriched });
    } else {
      res.status(400).json({ error: "No userId or search provided" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  } finally {
    if (client) client.release();
  }
});

module.exports = getBooks;