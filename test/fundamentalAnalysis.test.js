require("dotenv").config();
const chai = require("chai");
const chaiHttp = require("chai-http");
const { server } = require("../app");
const FundamentalAnalysis = require("../models/FundamentalAnalysis");
const User = require("../models/User");
const { expect } = chai;

chai.use(chaiHttp);

describe("Fundamental Analysis API", function () {
  this.timeout(10000);

  let analysisId = "";
  let token = "";

  before(async () => {
    // Clean up database before running tests
    await FundamentalAnalysis.deleteMany({});
    await User.deleteMany({});
  });

  after(async () => {
    // Clean up after tests
    await FundamentalAnalysis.deleteMany({});
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

  it("should create a new fundamental analysis", (done) => {
    chai
      .request(server)
      .post("/api/v1/fundamental-analysis")
      .set("Authorization", `Bearer ${token}`)
      .send({
        asset: "AAPL",
        analysisType: "Earnings Report",
        description: "Strong quarterly earnings.",
        conclusion: "Buy",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("fundamentalAnalysisId");
        analysisId = res.body.fundamentalAnalysisId;
        done();
      });
  });

  it("should fetch all fundamental analyses", (done) => {
    chai
      .request(server)
      .get("/api/v1/fundamental-analysis")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("analyses").that.is.an("array");
        done();
      });
  });

  it("should get a single fundamental analysis by ID", (done) => {
    chai
      .request(server)
      .get(`/api/v1/fundamental-analysis/${analysisId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id").that.equals(analysisId);
        done();
      });
  });

  it("should update a fundamental analysis by ID", (done) => {
    chai
      .request(server)
      .put(`/api/v1/fundamental-analysis/${analysisId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        asset: "AAPL",
        analysisType: "Market Update",
        description: "Updated market trends.",
        conclusion: "Hold",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").that.equals("Fundamental analysis updated successfully");
        done();
      });
  });

  it("should delete a fundamental analysis by ID", (done) => {
    chai
      .request(server)
      .delete(`/api/v1/fundamental-analysis/${analysisId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").that.equals("Fundamental analysis deleted successfully");
        done();
      });
  });

  it("should return 404 for non-existing fundamental analysis", (done) => {
    chai
      .request(server)
      .get(`/api/v1/fundamental-analysis/65d2ab999999999999999999`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message").that.equals("Fundamental analysis not found");
        done();
      });
  });
});
