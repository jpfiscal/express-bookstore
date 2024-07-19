process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("../db");
const Book = require("../models/book");
const app = require("../app");

let testBook;

beforeEach(async function() {
    let result = await db.query(
        `INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES ('0691161518', 'http://a.co/eobPtX2', 'Matthew Lane', 'english', 264, 'Princeton University Press', 'Power-Up: Unlocking the Hidden Mathematics in Video Games', 2017)
        RETURNING isbn, amazon_url, author, language, pages, publisher, title, year`
    )
    testBook = result.rows[0];
    console.log(`TESTBOOK: ${JSON.stringify(testBook)}`)
})

describe("GET /books", function(){
    test("Gets a list of 1 book", async function(){
        const response = await request(app).get(`/books`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            books: [testBook]
        });
    });
})

describe("GET /books/:id", function(){
    test("Gets the book associated to params isbn", async function(){
        const response = await request(app).get(`/books/${testBook.isbn}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            book: testBook
        });
    }) 
})
//happy path POST
describe("POST /books", function(){
    test("Creates a new book successfully", async function(){
        const newBook = {
            isbn: "1231231234",
            amazon_url: "https://www.amazon.ca/clifford-the-big-red-dog",
            author: "Some Guy",
            language: "English",
            pages: 20,
            publisher: "Penguin",
            title: "Clifford the Big Red Dog",
            year: 1983
        }
        const response = await request(app).post(`/books`).send(newBook);
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            book: newBook
        });
    })
})
//unhappy path POST
describe("POST /books", function(){
    test("Creates a new book but with number for isbn", async function(){
        const newBook = {
            isbn: 1231231234,
            amazon_url: "https://www.amazon.ca/clifford-the-big-red-dog",
            author: "Some Guy",
            language: "English",
            pages: 20,
            publisher: "Penguin",
            title: "Clifford the Big Red Dog",
            year: 1983
        }
        const response = await request(app).post(`/books`).send(newBook);
        expect(response.statusCode).toEqual(400);
        expect(response.body.message).toEqual(["instance.isbn is not of a type(s) string"]);
    })
})
//unhappy path POST
describe("POST /books", function(){
    test("Creates a new book but with string for page number", async function(){
        const newBook = {
            isbn: "1231231234",
            amazon_url: "https://www.amazon.ca/clifford-the-big-red-dog",
            author: "Some Guy",
            language: "English",
            pages: "20",
            publisher: "Penguin",
            title: "Clifford the Big Red Dog",
            year: 1983
        }
        const response = await request(app).post(`/books`).send(newBook);
        expect(response.statusCode).toEqual(400);
        expect(response.body.message).toEqual(["instance.pages is not of a type(s) integer"]);
    })
})
//unhappy path POST
describe("POST /books", function(){
    test("Creates a new book but with string for year", async function(){
        const newBook = {
            isbn: "1231231234",
            amazon_url: "https://www.amazon.ca/clifford-the-big-red-dog",
            author: "Some Guy",
            language: "English",
            pages: 20,
            publisher: "Penguin",
            title: "Clifford the Big Red Dog",
            year: "1983"
        }
        const response = await request(app).post(`/books`).send(newBook);
        expect(response.statusCode).toEqual(400);
        expect(response.body.message).toEqual(["instance.year is not of a type(s) integer"]);
    })
})
//unhappy path POST
describe("POST /books", function(){
    test("Creates a new book but with missing amazon_url attribute", async function(){
        const newBook = {
            isbn: "1231231234",
            author: "Some Guy",
            language: "English",
            pages: 20,
            publisher: "Penguin",
            title: "Clifford the Big Red Dog",
            year: 1983
        }
        const response = await request(app).post(`/books`).send(newBook);
        expect(response.statusCode).toEqual(400);
        expect(response.body.message).toEqual(["instance requires property \"amazon_url\"",]);
    })
})
//happy path PUT
describe("PUT /books/:id", function(){
    test("Updates an existing isbn with new info", async function(){
        const updatedTestBook = {
            isbn: "0691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "French",
            pages: 264,
            publisher: "Penguin",
            title: "Power-Down: Slow Your Role",
            year: 2018
        }
        const response = await request(app).put(`/books/${testBook.isbn}`).send(updatedTestBook);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            book: updatedTestBook
        });
    })
})
//unhappy path PUT
describe("PUT /books/:id", function(){
    test("Updates but with isbn that is a number", async function(){
        const updatedTestBook = {
            isbn: 691161518,
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "French",
            pages: 264,
            publisher: "Penguin",
            title: "Power-Down: Slow Your Role",
            year: 2018
        }
        const response = await request(app).put(`/books/${testBook.isbn}`).send(updatedTestBook);
        expect(response.statusCode).toEqual(400);
        expect(response.body).toEqual({
            error: {
                "message": [
                    "instance.isbn is not of a type(s) string"
                ],
                "status": 400
            },
            message: [
                "instance.isbn is not of a type(s) string"
            ]
        });
    })
})

afterEach(async function(){
    await db.query("DELETE FROM books");
})

afterAll(async function(){
    await db.end();
})