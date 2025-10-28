const express = require("express");
const { removeCommentById } = require("../controllers/comments-controller");
const commentsRouter = express.Router();

commentsRouter.delete("/:comment_id", removeCommentById);

module.exports = commentsRouter;