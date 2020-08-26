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
let repository = data.user_repository;
describe("test cases for get forked repo api", function () {
  let repoId, parentRepoId;
  before((done) => {
    db.repositories.create(repository).then((res) => {
      parentRepoId = res.id;
      let repositoryData = { ...repository };
      repositoryData.github_repo_id = faker.random.number();
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

  it("should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/getForkedRepo?id=${parentRepoId}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/getForkedRepo?id=${repoId}`)
      .end(function (err, res) {
        should(res.status).eql(404);
        done();
      });
  });

  it("send invalid id should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/getForkedRepo?id=12qw`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });

  it("find by invalid id should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/getForkedRepo?id=12345`)
      .end(function (err, res) {
        should(res.status).eql(404);
        done();
      });
  });
});
