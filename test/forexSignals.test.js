require("dotenv").config();
const chai = require("chai");
const chaiHttp = require("chai-http");
const { server } = require("../app");
const ForexSignal = require("../models/ForexSignal");
const User = require("../models/User");
const { expect } = chai;

chai.use(chaiHttp);

describe("Forex Signal API", function () {
  this.timeout(10000);

  let token = "";
  let signalId = "";

  before(async () => {
    // Clean up the database before running tests
    await ForexSignal.deleteMany({});
    await User.deleteMany({});
  });

  after(async () => {
    // Clean up after tests
    await ForexSignal.deleteMany({});
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

  it("should create a new forex signal", (done) => {
    chai
      .request(server)
      .post("/api/v1/forex-signals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currencyPair: "EUR/USD",
        action: "Buy",
        entryPrice: 1.1234,
        stopLoss: 1.1200,
        takeProfit: 1.1300,
        description: "Test forex signal",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("signalId");
        signalId = res.body.signalId;
        done();
      });
  });

  it("should get all forex signals", (done) => {
    chai
      .request(server)
      .get("/api/v1/forex-signals")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("signals").that.is.an("array");
        done();
      });
  });

  it("should get a forex signal by ID", (done) => {
    chai
      .request(server)
      .get(`/api/v1/forex-signals/${signalId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id", signalId);
        done();
      });
  });

  it("should update a forex signal", (done) => {
    chai
      .request(server)
      .put(`/api/v1/forex-signals/${signalId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Updated forex signal" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Forex signal updated successfully");
        done();
      });
  });

  it("should delete a forex signal", (done) => {
    chai
      .request(server)
      .delete(`/api/v1/forex-signals/${signalId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Forex signal deleted successfully");
        done();
      });
  });
});
