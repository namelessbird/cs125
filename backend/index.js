const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const router = require('./routes/router')
require('dotenv').config()
const pool = require("./db")

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use('/', router)

const port = 4000
app.listen(port, async () => {
    console.log(`server running on port ${port}`)
    const client = await pool.connect()
    try {
        const result = await client.query('SELECT version()')
        console.log(result.rows[0])
        console.log("Connected Successfully to DB!")
    } finally {
        client.release()
    }
})