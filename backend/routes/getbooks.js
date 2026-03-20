const express = require("express");
const getBooks = express.Router();
const pool = require("../db");
const axios = require("axios");

getBooks.get("/", async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    const { search, userId } = req.query;

    let finalBookLength = null;
    let finalPublicationDate = null;
    let finalPreference = null;

    if (userId) {
      const prefRes = await client.query(
        `SELECT book_length, publication_date, preference
         FROM books.user_preferences
         WHERE user_id = $1`,
        [userId]
      );

      if (prefRes.rows.length > 0) {
        finalBookLength = prefRes.rows[0].book_length;
        finalPublicationDate = prefRes.rows[0].publication_date;
        finalPreference = prefRes.rows[0].preference;
      }
    }

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
    } else {
      const conditions = [`isbn13 IS NOT NULL`];
      const values = [];
      let idx = 1;

      if (finalBookLength === "Under 250 pages") {
        conditions.push(`num_pages IS NOT NULL AND num_pages < $${idx}`);
        values.push(250);
        idx++;
      } else if (finalBookLength === "250-400 pages") {
        conditions.push(`num_pages IS NOT NULL AND num_pages BETWEEN $${idx} AND $${idx + 1}`);
        values.push(250, 400);
        idx += 2;
      } else if (finalBookLength === "400-600 pages") {
        conditions.push(`num_pages IS NOT NULL AND num_pages BETWEEN $${idx} AND $${idx + 1}`);
        values.push(401, 600);
        idx += 2;
      } else if (finalBookLength === "600+ pages") {
        conditions.push(`num_pages IS NOT NULL AND num_pages > $${idx}`);
        values.push(600);
        idx++;
      }

      if (finalPublicationDate === "Classic (pre-1970)") {
        conditions.push(`EXTRACT(YEAR FROM publication_date) < $${idx}`);
        values.push(1970);
        idx++;
      } else if (finalPublicationDate === "1970-2000") {
        conditions.push(`EXTRACT(YEAR FROM publication_date) BETWEEN $${idx} AND $${idx + 1}`);
        values.push(1970, 2000);
        idx += 2;
      } else if (finalPublicationDate === "2000-2015") {
        conditions.push(`EXTRACT(YEAR FROM publication_date) BETWEEN $${idx} AND $${idx + 1}`);
        values.push(2000, 2014);
        idx += 2;
      } else if (finalPublicationDate === "Recent (2015+)") {
        conditions.push(`EXTRACT(YEAR FROM publication_date) >= $${idx}`);
        values.push(2015);
        idx++;
      }

      if (finalPreference === "Critically acclaimed books") {
        conditions.push(`avg_rating >= 4.0`);
      } else if (finalPreference === "Bestsellers") {
        conditions.push(`rating_count > 10000`);
      }

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

      const toReadRes = await client.query(
        `
        SELECT b.*,
        (
          (b.rating_count::float / (b.rating_count + 1000)) * b.avg_rating +
          (1000.0 / (b.rating_count + 1000)) *
          (SELECT AVG(avg_rating) FROM books.book WHERE avg_rating IS NOT NULL)
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
        [userId]
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
          (1000.0 / (b.rating_count + 1000)) *
          (SELECT AVG(avg_rating) FROM books.book WHERE avg_rating IS NOT NULL)
        ) AS score
        FROM books.book b, random_search rs
        WHERE b.title ILIKE '%' || rs.search_str || '%'
        ORDER BY score DESC
        LIMIT 5
        `,
        [userId]
      );

      let general = genRes.rows;
      let basedOnToRead = toReadRes.rows;
      let basedOnSearch = recentSearchRes.rows;

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