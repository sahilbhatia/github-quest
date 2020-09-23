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
let repository = data.user_repository;

/*eslint-disable  no-undef*/
describe("test cases for get forked repo api", function () {
  let repoId, parentRepoId;
  before((done) => {
    db.repositories.create(repository).then((res) => {
      parentRepoId = res.id;
      let repositoryData = { ...repository };
      repositoryData.source_repo_id = faker.random.number();
      repositoryData.parent_repo_id = parentRepoId;
      db.repositories.create(repositoryData).then((res) => {
        repoId = res.id;
        done();
      });
    });
  });

  after(async () => {
    await db.repositories.destroy({ where: { id: repoId } });
    await db.repositories.destroy({ where: { id: parentRepoId } });
  });

  it("get child repo and should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/forks?id=${parentRepoId}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("pass id have no child should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/forks?id=${repoId}`)
      .end(function (err, res) {
        should(res.status).eql(404);
        done();
      });
  });

  it("get forked repo by invalid id should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/forks?id=12qw`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });

  it("get forked repo by invalid id should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/forks?id=12345`)
      .end(function (err, res) {
        should(res.status).eql(404);
        done();
      });
  });
});
/*eslint-disable  no-undef*/
