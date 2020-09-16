const dbConn = require("../models/sequelize");
dbConn.sequelize;
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = require("should");
chai.use(chaiHttp);
const app = process.env.SERVER;
/*eslint-disable  no-undef*/
describe("test cases for cron schedule", function () {
  it("insert users and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/insert-users")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("insert public repositories and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/insert-repositories")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("insert projects and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/insert-projects")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });
});
/*eslint-disable  no-undef*/
