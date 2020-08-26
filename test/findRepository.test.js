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
describe("test cases for find user api", function () {
  let userId, repoId;
  before( (done) => {
    db.users.create(user).then((res) => {
      userId = res.id;
      db.repositories.create(repository).then((res) => {
        repoId = res.id;
        db.users_repositories.create({ user_id: userId, repository_id: repoId });
        done();
      });
    });
  });

  after(async () => {
    await db.users_repositories.destroy({ where: { user_id: userId } })
    await db.users.destroy({ where: { id: userId } });
    await db.repositories.destroy({ where: { id: repoId } });
  });

  it("should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/findRepository")
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("find by user name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/findRepository?userName=${user.name}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Array();
        done();
      });
  });

  it("find by repository name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/findRepository?repositoryName=${repository.name}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Array();
        done();
      });
  });


  it("find by id should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/findRepository?userId=${userId}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("find by invalid id should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/findRepository?userId=azby12`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });

  it("find by invalid id should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/findRepository?userId=12345`)
      .end(function (err, res) {
        should(res.status).eql(404);
        done();
      });
  });
});
