const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data")
const request = require("supertest");
const app = require("../app.js");
require("jest-sorted");
const { fetchArticles } = require("../models/articles-model.js");

beforeEach(() => seed(data))

afterAll(() => db.end())

describe("GET api/articles", () => { 
    test("Articles returns a status of 200 and is not empty", ()=> {
        return request(app).get('/api/articles')
        .expect(200)
        .then(({body}) => {
            expect(body.articles.length).toBeGreaterThan(0)
        });
    })
    test("Does not return article body ", () => {
        return request(app).get('/api/articles')
        .expect(200)
        .then(({body}) => {
        body.articles.forEach((article) => {
        expect(article).not.toHaveProperty("body");
        })
      })
    
    })
})
describe("GET api/articles/:article_id", () =>{
    test("Returns an article with the correct fields when passed /api/articles/1", () => {
        return request(app).get('/api/articles/1')
        .expect(200)
        .then(({body}) =>{
            expect(body.article).toHaveProperty("author", expect.any(String))
            expect(body.article).toHaveProperty("title", expect.any(String))
            expect(body.article).toHaveProperty("article_id", expect.any(Number))
            expect(body.article).toHaveProperty("body", expect.any(String))
            expect(body.article).toHaveProperty("topic", expect.any(String))
            expect(body.article).toHaveProperty("created_at", expect.any(String))
            expect(body.article).toHaveProperty("votes", expect.any(Number))
            expect(body.article).toHaveProperty("article_img_url", expect.any(String))
        })
    })
    test("Returns an article with the correct article ID when passed an article endpoint.", () =>{
        return request(app).get('/api/articles/5')
        .then(({body}) => {
            expect(body.article.article_id).toBe(5)
        })

    })
})

describe("GET /api/articles/:article_id/comments", () =>{
    test("Returns all comments for that article", () =>{
    return request(app).get('/api/articles/1/comments')
        .expect(200)
        .then(({body}) => {
            expect(body.comments.length).toBe(11)
        })

})
})


describe("GET /api/users", () => {
    test("Returns a status 200 and a JSON object",() => { 
        return request(app).get('/api/users')
        .expect(200)
        .then(({body}) =>{
         expect(body.users).toBeInstanceOf(Object)      
        })
    })
    test("Users is not empty", () =>{
        return request(app).get('/api/users')
        .then(({body}) => {
            expect(body.users.length).toBeGreaterThan(0)
        })
    })
    test("Users contains the required fields", () => {
        return request(app).get('/api/users')
        .then(({body}) => {
            body.users.forEach((user) => {
                expect(user).toHaveProperty("username", expect.any(String))
                expect(user).toHaveProperty("name", expect.any(String))
                expect(user).toHaveProperty("avatar_url", expect.any(String))
            })
        })
    })
})  

describe("POST /api/articles/:article_id/comments", () => {
    test("Adds a new comment and returns the added comment.", () => {
        const newComment = {username: "icellusedkars", body: "What the hell did I just read?"}
        return request(app).post("/api/articles/1/comments")
        .send(newComment)
        .expect(201)
        .then(({body}) => {
            expect(body.comment).toHaveProperty("comment_id", expect.any(Number));
            expect(body.comment).toHaveProperty("body", "What the hell did I just read?");
            expect(body.comment).toHaveProperty("author", "icellusedkars");
            expect(body.comment).toHaveProperty("article_id", 1);
        })
    })
    test("Responds with a 401 if username of body is missing", () => {
        return request(app).post("/api/articles/:article_id/comments")
        .send({username: "icellusedcars"})
        .expect(400)
        .then(({body})=> {
            expect(body.msg).toBe("Missing username or comment body.")
        })
    })
      test("Responds 404 if article_id does not exist", () => {
    const newComment = { username: "butter_bridge", body: "Hello" };
    return request(app).post("/api/articles/9999/comments")
      .send(newComment)
      .expect(404);
  });
})
describe("DELETE /api/comments/:comment_id", () => {
    test("Deletes a record and returns no content.", () => {
        return request(app)
        .delete("/api/comments/1")
        .expect(204)
        .then(({ body }) => {
        expect(body).toEqual({});
    });
});
    
    test("Responds with 404 when trying to delete comment that doesn't exist.", () => {
         return request(app)
         .delete("/api/comments/10000000")
         .expect(404)
         .then(({body}) => {
            expect(body.msg).toBe("Comment not found.")
         })       
    })
    test("Resposnds with 400 when given an invalid id", () => {
        return request(app)
        .delete("/api/comments/some-comment")
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe("Invalid comment ID.")
        })
    })
})

describe("/api/articles query", () => {
    test("200: sorts articles by title ascending", () => {
  return request(app)
    .get("/api/articles?sort_by=title&order=asc")
    .expect(200)
    .then(({ body }) => {
      expect(body.articles).toBeSortedBy("title", { ascending: true });
    });
});

})
describe("fetchArticles with topic query", () => {
  test("returns only articles matching the specified topic", () => {
    return fetchArticles("created_at", "desc", "mitch").then((articles) => {
      expect(articles).toBeInstanceOf(Array);
      expect(articles.length).toBeGreaterThan(0);
      articles.forEach((article) => {
        expect(article.topic).toBe("mitch");
      });
    });
  });

  test("returns empty array if topic exists but has no articles", () => {
    return fetchArticles("created_at", "desc", "nonexistenttopic").then((articles) => {
      expect(articles).toEqual([]);
    });
  });

  test("returns all articles if topic is undefined", () => {
    return fetchArticles().then((articles) => {
      expect(articles).toBeInstanceOf(Array);
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  test("rejects if topic is not a string", () => {
    return expect(fetchArticles("created_at", "desc", 123)).rejects.toEqual({
      status: 400,
      msg: "Invalid topic query",
    });
  });
});
describe("comment count - GET  /api/articles/:article_id", () => {
    test("returns the corect comment count", () => {
    return request(app).get('/api/articles/3')
    .expect(200)
    .then(({body}) => {
         expect(body.article.comment_count).toEqual(2)
    })
    })
})