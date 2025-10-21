const db = require("../connection")
const format = require("pg-format")
const {convertTimestampToDate} = require("./utils")




const seed = ({ topicData, userData, articleData, commentData }) => {
  return db.query("DROP TABLE IF EXISTS comments, articles, users, topics;").then(() => {
    return db.query("CREATE TABLE topics (slug VARCHAR(255) PRIMARY KEY, description VARCHAR(500), img_url VARCHAR(1000));")
  })
  .then(() => {
    return db.query("CREATE TABLE users(username VARCHAR(255) PRIMARY KEY, name VARCHAR(255), avatar_url VARCHAR (1000));")

  })
  .then(() => {
    return db.query("CREATE TABLE articles(article_id SERIAL PRIMARY KEY,title VARCHAR(255), topic VARCHAR(255) REFERENCES topics(slug), author VARCHAR(255) REFERENCES users(username), body TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, votes INT DEFAULT 0, article_img_url VARCHAR(1000));")
  })
   .then(() => {
    return db.query("CREATE TABLE comments(comment_id SERIAL PRIMARY KEY, article_id INT REFERENCES articles(article_id), body TEXT, votes INT DEFAULT 0, author VARCHAR(255) REFERENCES users(username), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);")
  })
  .then (() => {
     const formattedTopics = []
    topicData.forEach((topic) =>{
      formattedTopics.push([topic.slug, topic.description, topic.img_url]) ;
    })
     const sqlString = format("INSERT INTO topics(slug, description, img_url) VALUES %L ", formattedTopics)
    
    return db.query(sqlString)
  })
  .then(() => {
    const formattedUsers =[]
    userData.forEach((user) =>{
      formattedUsers.push([user.username, user.name, user.avatar_url]) ;
    })
    const sqlString = format("INSERT INTO users(username, name , avatar_url ) VALUES %L ", formattedUsers)
    return db.query(sqlString)
  })
  .then(() => {
    const articleDataWithDate = articleData.map(convertTimestampToDate)
    const formattedArticles = []
    articleDataWithDate.forEach((article) =>{
      formattedArticles.push([article.title, article.topic, article.author, article.body, article.created_at, article.votes, article.article_img_url]) ;
    })
   
     const sqlString = format("INSERT INTO articles(title, topic , author, body, created_at, votes, article_img_url ) VALUES %L RETURNING *;", formattedArticles)
     return db.query(sqlString)
  })
  .then(({ rows: insertedArticles }) => {
  const articleIdLookup = {};
  insertedArticles.forEach((article) => {
    articleIdLookup[article.title] = article.article_id;
  });

  const commentDataWithDate = commentData.map(convertTimestampToDate);
  const formattedComments = commentDataWithDate.map((comment) => [articleIdLookup[comment.article_title],comment.body,comment.votes,comment.author,comment.created_at,
  ]);

  const sqlString = format(
    "INSERT INTO comments(article_id, body, votes, author, created_at) VALUES %L;",
    formattedComments
  );
  return db.query(sqlString);
});

   
};``
module.exports = seed;
