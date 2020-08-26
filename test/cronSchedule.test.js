const dbConn = require("../models/sequelize");
dbConn.sequelize;
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = require('should');
chai.use(chaiHttp);
const app = process.env.SERVER;

describe("test cases for cron schedule", function () {
  it("insert users and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/insertUsers")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("insert public repositories and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/insertPublicRepos")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("insert projects and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/insertProjects")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });
});
