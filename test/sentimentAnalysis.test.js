require("dotenv").config();
const chai = require("chai");
const chaiHttp = require("chai-http");
const { server } = require("../app");
const SentimentAnalysis = require("../models/SentimentAnalysis");
const User = require("../models/User");
const { expect } = chai;

chai.use(chaiHttp);

describe("Sentiment Analysis API", function () {
  this.timeout(10000);

  let sentimentId = "";
  let token = "";

  before(async () => {
    // Clean up database before running tests
    await SentimentAnalysis.deleteMany({});
  });

  after(async () => {
    // Clean up after tests
    await SentimentAnalysis.deleteMany({});
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

  it("should create a new sentiment analysis", (done) => {
    chai
      .request(server)
      .post("/api/v1/sentiment-analysis")
      .set("Authorization", `Bearer ${token}`)
      .send({
        asset: "BTC/USD",
        sentiment: "Bullish",
        confidenceLevel: 85,
        description: "Positive market outlook due to institutional adoption.",
        userId: "12345",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("sentimentId");
        sentimentId = res.body.sentimentId;
        done();
      });
  });

  it("should fetch all sentiment analyses", (done) => {
    chai
      .request(server)
      .get("/api/v1/sentiment-analysis?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("analyses").that.is.an("array");
        done();
      });
  });

  it("should get a single sentiment analysis by ID", (done) => {
    chai
      .request(server)
      .get(`/api/v1/sentiment-analysis/${sentimentId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id", sentimentId);
        done();
      });
  });

  it("should update a sentiment analysis", (done) => {
    chai
      .request(server)
      .put(`/api/v1/sentiment-analysis/${sentimentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        asset: "BTC/USD",
        sentiment: "Bearish",
        confidenceLevel: 75,
        description: "Market sentiment changed due to regulatory concerns.",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Sentiment analysis updated successfully");
        done();
      });
  });

  it("should delete a sentiment analysis", (done) => {
    chai
      .request(server)
      .delete(`/api/v1/sentiment-analysis/${sentimentId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Sentiment analysis deleted successfully");
        done();
      });
  });

  it("should return 404 for non-existing sentiment analysis", (done) => {
    chai
      .request(server)
      .get(`/api/v1/sentiment-analysis/65d2ab999999999999999999`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message").that.equals("Sentiment analysis not found");
        done();
      });
  });
});
