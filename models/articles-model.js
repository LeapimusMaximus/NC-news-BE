const db = require("../db/connection");

exports.fetchArticles = (sort_by = "created_at", order = "desc", topic) => {

   const validColumns = [
    "article_id",
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
    "comment_count",
    "article_img_url"
  ];

  const validOrders = ["asc", "desc"];

  if (!validColumns.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by query" });
  }

  if (!validOrders.includes(order.toLowerCase())) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

 let sqlString = `
  SELECT 
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
`;
const queryValues = [];

  if (topic !== undefined) {
  if (typeof topic !== "string") {
    return Promise.reject({ status: 400, msg: "Invalid topic query" });
  }
  sqlString += ` WHERE articles.topic ILIKE $1`;
  queryValues.push(topic);
}

sqlString += ` GROUP BY articles.article_id`;

if (sort_by === "comment_count") {
  sqlString += ` ORDER BY COUNT(comments.comment_id) ${order.toUpperCase()};`;
} else {
  sqlString += ` ORDER BY articles.${sort_by} ${order.toUpperCase()};`;
}

  return db.query(sqlString, queryValues).then(({ rows }) => rows)
};

exports.fetchArticleById = (article_id) => {
  const sql = `
    SELECT 
      articles.*,
      COUNT(comments.comment_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments 
      ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;
  `;
  return db
    .query(sql, [article_id])
    .then(({ rows }) =>{
      if (rows.length=== 0){
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0]
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
      [article_id]
    )
    .then(({ rows }) => rows);
};