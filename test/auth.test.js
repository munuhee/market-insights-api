require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const { server } = require('../app');
const User = require('../models/User');
const { expect } = chai;

chai.use(chaiHttp);

describe("Auth API", function () {
  this.timeout(10000);

  before(async () => {
    // Clean up the database before running tests
    await User.deleteMany({});
  });

  after(async () => {
    // Clean up after tests
    await User.deleteMany({});
    server.close();
  });

  let token = "";

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
        role: "subscriber",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("should not register a user with an existing email", (done) => {
    chai
      .request(server)
      .post("/api/v1/auth/register")
      .send({
        username: "testuser2",
        firstName: "Test",
        lastName: "User",
        email: "testuser@example.com",
        password: "Test1234",
      })
      .end((err, res) => {
        expect(res).to.have.status(409);
        expect(res.body.error).to.equal("User with this email already exists");
        done();
      });
  });

  it("should log in a user", (done) => {
    chai
      .request(server)
      .post("/api/v1/auth/login")
      .send({
        email: "testuser@example.com",
        password: "Test1234",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("token");
        token = res.body.token;
        done();
      });
  });

  it("should not log in with incorrect password", (done) => {
    chai
      .request(server)
      .post("/api/v1/auth/login")
      .send({
        email: "testuser@example.com",
        password: "WrongPassword",
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.error).to.equal("Authentication failed: Incorrect password");
        done();
      });
  });

  it("should not log in an unregistered user", (done) => {
    chai
      .request(server)
      .post("/api/v1/auth/login")
      .send({
        email: "notfound@example.com",
        password: "Test1234",
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.error).to.equal("Authentication failed: User not found");
        done();
      });
  });
});
