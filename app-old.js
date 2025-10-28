const express = require("express")
const app = express()
const db = require("./db/connection")
const articles = require("./db/data/test-data/articles")

app.get("/api/articles", (req, res) => {
    const sqlString = `SELECT 
                        articles.author,
                        articles.title,
                        articles.article_id,
                        articles.topic,
                        articles.created_at,
                        articles.votes,
                        articles.article_img_url,
                        COUNT(comments.comment_id)::INT AS comment_count
                        FROM articles
                        LEFT JOIN comments ON comments.article_id = articles.article_id
                        GROUP BY articles.article_id
                        ORDER BY articles.created_at DESC;`

    
    return db.query(sqlString)
    
    .then(({rows}) => {
        res.status(200).send({articles:rows})

    })
})
app.get("/api/articles/:article_id", (req, res) => {
    const articleId = req.params.article_id
    db.query('SELECT * FROM articles WHERE article_id = $1', [articleId])
    .then((body) => {
        res.status(200).send(body.rows[0])
    })
})
app.get("/api/articles/:article_id/comments", (req, res) =>{
    const articleId = req.params.article_id
    const sqlString = "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;"
    db.query(sqlString , [articleId])
    .then((body) => {
        // console.log(body)
        console.log(body.rowCount, "<==========8")
        res.status(200).send(body.rows)
    })
} )

app.get("/api/users", (req, res) =>{
    return db.query('SELECT * FROM users') 
    .then(({rows}) => {
        res.status(200).send({users:rows})
    })
})

app.post("/api/articles/:article_id/comments")

app.use((err, req, res, next) => {
console.error(err,"Fuckin error! YO!")
res.status(500)
.send()
})

module.exports = app;