const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const pool = require('../db')

const filePath = path.join(__dirname, '../data/books.csv')

function toInt(value) {
    const n = parseInt(value, 10)
    return Number.isNaN(n) ? null : n
}

function toFloat(value) {
    const n = parseFloat(value)
    return Number.isNaN(n) ? null : n
}


async function importBooks() {

    const client = await pool.connect()

    try {
        await client.query('BEGIN');

        const stream = fs.createReadStream(filePath)
        .pipe(csv({
            mapHeaders: ({ header }) => header.trim()
        }));

        for await (const row of stream) {
        await client.query(
            `
            INSERT INTO books.book
            (title, authors, avg_rating, isbn, isbn13, language_code, pages,
            rating_count, num_reviews, publication_date, publisher)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            `,
            [
                row.title,
                row.authors,
                toFloat(row.average_rating),
                row.isbn || null,
                row.isbn13 || null,
                row.language_code || null,
                toInt(row.num_pages),
                toInt(row.ratings_count),
                toInt(row.text_reviews_count),
                row.publication_date ? new Date(row.publication_date) : null,
                row.publisher || null
            ]
            );
        }

        await client.query('COMMIT')
        console.log('CSV import completed')
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Import failed:', err)
    } finally {
        client.release()
    }
    }

importBooks()
