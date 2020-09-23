const dbConn = require("../models/sequelize");
dbConn.sequelize;
const faker = require("faker");
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = require("should");
chai.use(chaiHttp);
const app = process.env.SERVER;
const db = require("../models/sequelize");
const data = require("./data");
let user = data.user;

/*eslint-disable  no-undef*/
describe("test cases for find user api", function () {
  let userId;

  before((done) => {
    user.github_handle = faker.random.alphaNumeric();
    user.source_type = faker.random.word();
    db.users.create(user).then((res) => {
      userId = res.id;
      done();
    });
  });

  after(async () => {
    await db.users.destroy({ where: { id: userId } });
  });

  it("find user without passing params and should give status 400", function (done) {
    chai
      .request(app)
      .get("/api/find-user")
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });

  it("find user by user name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/find-user?userName=${user.name}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Array();
        done();
      });
  });

  it("find user by git handle should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/find-user?gitHandle=${user.github_handle}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Array();
        done();
      });
  });

  it("find user by id should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/find-user?userId=${userId}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("find user by invalid id should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/find-user?userId=azby12`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });

  it("find user by invalid id should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/find-user?userId=12345`)
      .end(function (err, res) {
        should(res.status).eql(404);
        done();
      });
  });
});
/*eslint-disable  no-undef*/
