require("dotenv").config();
const chai = require("chai");
const chaiHttp = require("chai-http");
const { server } = require("../app");
const User = require("../models/User");
const { expect } = chai;

chai.use(chaiHttp);

describe("User API", function () {
  this.timeout(10000);

  let userId = "";
  let token = "";

  before(async () => {
    // Clean up database before running tests
    await User.deleteMany({});
  });

  after(async () => {
    // Clean up after tests
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

  it("should create a new user", (done) => {
    chai
      .request(server)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "testuser1",
        firstName: "Test",
        lastName: "User1",
        email: "testuser1@example.com",
        password: "Test1234",
        role: "free_user",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("userId");
        userId = res.body.userId;
        done();
      });
  });

  it("should get a single user by ID", (done) => {
    chai
      .request(server)
      .get(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id").that.equals(userId);
        done();
      });
  });

  it("should delete a user by ID", (done) => {
    chai
      .request(server)
      .delete(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").that.equals("User deleted successfully");
        done();
      });
  });

  it("should get a user by Email", (done) => {
    chai
      .request(server)
      .get(`/api/v1/users/email/testuser@example.com`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("email").that.equals("testuser@example.com");
        done();
      });
  });

  it("should return 404 for non-existing user", (done) => {
    chai
      .request(server)
      .get(`/api/v1/users/65d2ab999999999999999999`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("error").that.equals("User not found");
        done();
      });
  });
});
