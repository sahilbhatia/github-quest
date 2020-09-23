const dbConn = require("../models/sequelize");
dbConn.sequelize;
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = require("should");
chai.use(chaiHttp);
const app = process.env.SERVER;
const db = require("../models/sequelize");
const data = require("./data");
let user = data.user;
let repository = data.user_repository;

/*eslint-disable  no-undef*/
describe("test cases for find repository api", function () {
  let userId, repoId;
  before((done) => {
    db.users.create(user).then((res) => {
      userId = res.id;
      db.repositories.create(repository).then((res) => {
        repoId = res.id;
        db.users_repositories.create({
          user_id: userId,
          repository_id: repoId,
        });
        done();
      });
    });
  });

  after(async () => {
    await db.users_repositories.destroy({ where: { user_id: userId } });
    await db.users.destroy({ where: { id: userId } });
    await db.repositories.destroy({ where: { id: repoId } });
  });

  it("get empty list and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/find-repository")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Array();
        done();
      });
  });

  it("find repository by user name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/find-repository?userName=${user.name}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Array();
        done();
      });
  });

  it("find repository by repository name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/find-repository?repositoryName=${repository.name}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Array();
        done();
      });
  });

  it("find repository by id should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/find-repository?userId=${userId}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("find repositories by invalid id should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/find-repository?userId=azby12`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });

  it("find repositories by invalid id should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/find-repository?userId=12345`)
      .end(function (err, res) {
        should(res.status).eql(404);
        done();
      });
  });
});
/*eslint-disable  no-undef*/
