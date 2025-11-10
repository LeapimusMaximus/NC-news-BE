const express = require("express");
const app = express();
const cors = require('cors');

const articlesRouter = require("./routes/articles-router");
const usersRouter = require("./routes/users-router");
const commentsRouter = require("./routes/comments-router");


app.use(cors());
app.use(express.json());

app.use("/api", express.static('public'))
app.use("/api/articles", articlesRouter);
app.use("/api/users", usersRouter);
app.use("/api/comments", commentsRouter);


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ msg: "Internal Server Error" });
});



module.exports = app;
