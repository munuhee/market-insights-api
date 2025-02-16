require("dotenv").config();
const chai = require("chai");
const chaiHttp = require("chai-http");
const { server } = require("../app");
const Ebook = require("../models/Ebook");
const User = require("../models/User");
const { expect } = chai;

chai.use(chaiHttp);

describe("Ebook API", function () {
  this.timeout(10000);

  let ebookId = "";
  let token = "";

  before(async () => {
    // Clean up database before running tests
    await Ebook.deleteMany({});
  });

  after(async () => {
    // Clean up after tests
    await Ebook.deleteMany({});
    await User.deleteMany({});
    server.close();
  });

  it("should register a new user", (done) => {
    chai
      .request(server)
      .post("/api/v1/auth/register")
      .send({
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "testuser@example.com",
        password: "Test1234",
        role: "admin",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("should create a new ebook", (done) => {
    chai
      .request(server)
      .post("/api/v1/ebooks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Ebook",
        description: "This is a test ebook.",
        filePath: "/uploads/test-ebook.pdf",
        category: "Technology",
        userId: "65d2ab123456789abcdef123",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("_id");
        ebookId = res.body._id;
        done();
      });
  });

  it("should fetch all ebooks", (done) => {
    chai
      .request(server)
      .get("/api/v1/ebooks")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("ebooks").that.is.an("array");
        done();
      });
  });

  it("should get a single ebook by ID", (done) => {
    chai
      .request(server)
      .get(`/api/v1/ebooks/${ebookId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id").that.equals(ebookId);
        done();
      });
  });

  it("should update an ebook by ID", (done) => {
    chai
      .request(server)
      .put(`/api/v1/ebooks/${ebookId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Ebook Title",
        description: "Updated description.",
        filePath: "/uploads/updated-ebook.pdf",
        category: "Science",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("title").that.equals("Updated Ebook Title");
        done();
      });
  });

  it("should delete an ebook by ID", (done) => {
    chai
      .request(server)
      .delete(`/api/v1/ebooks/${ebookId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").that.equals("Ebook deleted successfully");
        done();
      });
  });

  it("should return 404 for non-existing ebook", (done) => {
    chai
      .request(server)
      .get(`/api/v1/ebooks/65d2ab999999999999999999`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message").that.equals("Ebook not found");
        done();
      });
  });
});
