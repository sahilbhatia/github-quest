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
describe("test cases for get User list api", function () {
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

  it("get users array length should equal to limit  and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/users?limit=2")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.users.length).eql(2);
        should(res.body.users).be.a.Array();
        done();
      });
  });

  it(" get all users and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/users")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.users).be.a.Array();
        done();
      });
  });

  it("get user by user name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/users?userName=${user.name}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.users[0].name).eql(user.name);
        should(res.body.users).be.a.Array();
        done();
      });
  });

  it("get user by invalid user name should give status 200 but array length 0", function (done) {
    chai
      .request(app)
      .get(`/api/users?userName=azby`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.users.length).eql(0);
        should(res.body.users).be.a.Array();
        done();
      });
  });

  it("get users by github handle should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/users?gitHandle=${user.github_handle}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.users).be.a.Array();
        done();
      });
  });

  it("get users by invalid github handle should give status 200 but array length 0", function (done) {
    chai
      .request(app)
      .get(`/api/users?gitHandle=azby`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.users.length).eql(0);
        should(res.body.users).be.a.Array();
        done();
      });
  });
});
/*eslint-disable  no-undef*/
