require("dotenv").config();
const chai = require("chai");
const chaiHttp = require("chai-http");
const { server } = require("../app");
const FinancialAdvice = require("../models/FinancialAdvice");
const User = require("../models/User");
const { expect } = chai;

chai.use(chaiHttp);

describe("Financial Advice API", function () {
  this.timeout(10000);

  let token = "";
  let adviceId = "";

  before(async () => {
    // Clean database before tests
    await FinancialAdvice.deleteMany({});
    await User.deleteMany({});
  });

  after(async () => {
    // Clean database after tests
    await FinancialAdvice.deleteMany({});
    await User.deleteMany({});
    server.close();
  });

  it("should register a new admin user", (done) => {
    chai
      .request(server)
      .post("/api/v1/auth/register")
      .send({
        username: "adminuser",
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: "Admin1234",
        role: "admin",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("should create a new financial advice", (done) => {
    chai
      .request(server)
      .post("/api/v1/financial-advice")
      .set("Authorization", `Bearer ${token}`)
      .send({
        asset: "Bitcoin",
        adviceType: "Buy",
        description: "Strong bullish trend detected.",
        userId: "65d2ab123456789abcdef123",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("adviceId");
        adviceId = res.body.adviceId;
        done();
      });
  });

  it("should get all financial advices", (done) => {
    chai
      .request(server)
      .get("/api/v1/financial-advice")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("advices").that.is.an("array");
        done();
      });
  });

  it("should get a financial advice by ID", (done) => {
    chai
      .request(server)
      .get(`/api/v1/financial-advice/${adviceId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id", adviceId);
        done();
      });
  });

  it("should update a financial advice by ID", (done) => {
    chai
      .request(server)
      .put(`/api/v1/financial-advice/${adviceId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Updated financial analysis." })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Financial advice updated successfully");
        done();
      });
  });

  it("should delete a financial advice by ID", (done) => {
    chai
      .request(server)
      .delete(`/api/v1/financial-advice/${adviceId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Financial advice deleted successfully");
        done();
      });
  });
});
