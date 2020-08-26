const dbConn = require("../models/sequelize");
dbConn.sequelize;
const faker = require("faker");
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = require('should');
chai.use(chaiHttp);
const app = process.env.SERVER;
const db = require("../models/sequelize");
const data = require("./data");
let user = data.user;
describe("test cases for get project api", function () {
  let userId;

  before((done) => {
    user.github_handle = faker.random.alphaNumeric();
    db.users.create(user).then((res) => {
      userId = res.id;
      done();
    });
  });

  after(async () => {
    await db.users.destroy({ where: { id: userId } });
  });

  it("array length should equal to limit  and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/getUserList?limit=2")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.users.length).eql(2);
        should(res.body.users).be.a.Array();
        done();
      });
  });

  it("should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/getUserList")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.users).be.a.Array();
        done();
      });
  });

  it("filter by user name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/getUserList?userName=${user.name}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.users[0].name).eql(user.name);
        should(res.body.users).be.a.Array();
        done();
      });
  });

  it("filter by invalid user name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/getUserList?userName=azby`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.users.length).eql(0);
        should(res.body.users).be.a.Array();
        done();
      });
  });

  it("filter by github handle should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/getUserList?githubHandle=${user.github_handle}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.users[0].name).eql(user.name);
        should(res.body.users).be.a.Array();
        done();
      });
  });

  it("filter by invalid github handle should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/getUserList?githubHandle=azby`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.users.length).eql(0);
        should(res.body.users).be.a.Array();
        done();
      });
  });
});
