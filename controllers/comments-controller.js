const { insertComment } = require("../models/comments-model");
const { deleteComment } = require("../models/comments-model")

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  if (!username || !body) {
    return res.status(400).json({ msg: "Missing username or comment body." });
  }

  insertComment(article_id, username, body)
    .then((comment) => res.status(201).send({ comment }))
    .catch((err) => {
      if (err.code === "23503"){
        res.status(404).json({msg: "Article not found."});
      }
      else {
        next(err)
      }
    });
};

exports.removeCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  deleteComment(comment_id)
    .then((deletedComment) => {
      if (!deletedComment) {
        return res.status(404).json({ msg: "Comment not found." });
      }
      res.status(204).send();
    })
    .catch((err) => {
      if (err.code === "22P02") {
        res.status(400).json({ msg: "Invalid comment ID." });
      } 
      else if (err.status){
        res.status(err.status).json({ msg: err.msg });
      }
      else {
        next(err);
      }
    });
};