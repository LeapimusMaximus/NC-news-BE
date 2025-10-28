const db = require("../db/connection");

exports.insertComment = (article_id, username, body) => {
  const sqlString = `
    INSERT INTO comments (article_id, author, body)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  return db.query(sqlString, [article_id, username, body])
           .then(({ rows }) => rows[0]);
};

exports.deleteComment = (comment_id) => {
  const sqlString = `DELETE FROM comments WHERE comment_id = $1 RETURNING *`

  return db.query(sqlString, [comment_id])
  .then(({rows}) => {
    if (rows.length === 0){
      return Promise.reject({ status: 404, msg: "Comment not found." });
    }
    return rows[0]
  })
}