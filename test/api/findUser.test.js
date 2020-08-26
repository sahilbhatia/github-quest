const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const faker = require("faker");
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = require('should');
chai.use(chaiHttp);
const app = "http://localhost:3000";
const db = require("../../models/sequelize");
const data = require("../data");
let user = data.user;
describe("test cases for find user api", function () {
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

  it("should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/findUser")
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("find by user name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/findUser?userName=${user.name}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Array();
        done();
      });
  });

  it("find by github handle should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/findUser?githubHandle=${user.github_handle}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Array();
        done();
      });
  });

  
  it("find by id should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/findUser?userId=${userId}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("find by invalid id should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/findUser?userId=azby12`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });

  it("find by invalid id should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/findUser?userId=12345`)
      .end(function (err, res) {
        should(res.status).eql(404);
        done();
      });
  });
});
