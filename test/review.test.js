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

let user_repository = data.user_repository;

describe("test cases for review repositories", function () {
  let repoId;
  before((done) => {
    db.repositories.create(user_repository).then((res) => {
        repoId = res.id;
      done();
    });
  });

  after(async () => {
    await db.repositories.destroy({ where: { id: repoId } });
  });

  it("update manual review status and should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/updateManualReview?id=${repoId}&updatedAt=2020-08-27T09:04:33.568Z`)
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("update time not pass and should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/updateManualReview?id=${repoId}`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });

  it("send invalid id and should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/updateManualReview?id=7000&updatedAt=2020-08-27T09:04:33.568Z`)
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("send non numeric id and should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/updateManualReview?id=1aw&updatedAt=2020-08-27T09:04:33.568Z`)
      .end(function (err, res) {
        should(res.status).eql(400);
        should(res.body).be.a.Object();
        done();
      });
  });


  it("update suspicious repo and should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/updateSuspiciousRepos?id=${repoId}&updatedAt=2020-08-27T09:04:33.568Z`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("send invalid id and should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/updateSuspiciousRepos?id=7000&updatedAt=2020-08-27T09:04:33.568Z`)
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("send non numeric id and should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/updateSuspiciousRepos?id=1aw&updatedAt=2020-08-27T09:04:33.568Z`)
      .end(function (err, res) {
        should(res.status).eql(400);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("update time not pass and should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/updateSuspiciousRepos?id=${repoId}`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });
});
