const dbConn = require("../models/sequelize");
dbConn.sequelize;
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = require("should");
chai.use(chaiHttp);
const app = process.env.SERVER;
const db = require("../models/sequelize");
const data = require("./data");
let user_repository = data.user_repository;

/*eslint-disable  no-undef*/
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

  it("update manual review with valid repo id and status and should give status 200", function (done) {
    chai
      .request(app)
      .get(
        `/api/update-manual-review?id=${repoId}&updatedAt=2020-08-27T09:04:33.568Z`
      )
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("update manual review without passing update time and should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/update-manual-review?id=${repoId}`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });

  it("update manual review with invalid id and should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/update-manual-review?id=7000&updatedAt=2020-08-27T09:04:33.568Z`)
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("update manual review with non numeric id and should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/update-manual-review?id=1aw&updatedAt=2020-08-27T09:04:33.568Z`)
      .end(function (err, res) {
        should(res.status).eql(400);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("update suspicious repo with valid repo id and should give status 200", function (done) {
    chai
      .request(app)
      .get(
        `/api/update-suspicious-repository?id=${repoId}&updatedAt=2020-08-27T09:04:33.568Z`
      )
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("update suspicious repo with invalid repo id and should give status 404", function (done) {
    chai
      .request(app)
      .get(
        `/api/update-suspicious-repository?id=7000&updatedAt=2020-08-27T09:04:33.568Z`
      )
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("update suspicious repo with non numeric repo id and should give status 400", function (done) {
    chai
      .request(app)
      .get(
        `/api/update-suspicious-repository?id=1aw&updatedAt=2020-08-27T09:04:33.568Z`
      )
      .end(function (err, res) {
        should(res.status).eql(400);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("update suspicious repo without update time and should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/update-suspicious-repository?id=${repoId}`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });
});
/*eslint-disable  no-undef*/
