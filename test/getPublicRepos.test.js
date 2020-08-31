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
describe("test cases for get public repo api", function () {
  let userRes, repoRes1, repoRes2;
  let repositoryData1 = {
    github_repo_id: faker.random.number(),
    url: faker.internet.url(),
    name: faker.random.word(),
    is_forked: false,
    is_archived: false,
    is_disabled: false,
    is_suspicious: false,
    manual_review: false,
    review: "pending",
    is_private: false,
  };
  let repositoryData2 = {
    github_repo_id: faker.random.number(),
    url: faker.internet.url(),
    name: faker.random.word(),
    is_forked: true,
    is_archived: true,
    is_disabled: true,
    is_suspicious: true,
    review: "no action",
    is_private: true,
    error_details: faker.random.word(),
  };
  before(async () => {
    userRes = await db.users.create(user);
    repoRes1 = await db.repositories.create(repositoryData1);
    repoRes2 = await db.repositories.create(repositoryData2);
    await db.users_repositories.create({
      user_id: userRes.id,
      repository_id: repoRes1.id,
    });
    await db.users_repositories.create({
      user_id: userRes.id,
      repository_id: repoRes2.id,
    });
  });

  after(async () => {
    await db.users_repositories.destroy({ where: { user_id: userRes.id } });
    await db.users.destroy({ where: { id: userRes.id } });
    await db.repositories.destroy({ where: { id: repoRes1.id } });
    await db.repositories.destroy({ where: { id: repoRes1.id } });
  });

  it("array length should equal to limit  and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/getPublicRepos?limit=2")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.repositories.length).eql(2);
        should(res.body.repositories).be.a.Array();
        done();
      });
  });

  it("should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/getPublicRepos")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.repositories).be.a.Array();
        done();
      });
  });

  it("filter should give status 200 with correct response", function (done) {
    chai
      .request(app)
      .get(
        `/api/getPublicRepos?is_forked=false&is_archived=false&is_disabled=false&is_suspicious=false&review=pending&is_private=false&error_details=false`
      )
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.repositories[0].is_forked).eql(false);
        should(res.body.repositories[0].is_archived).eql(false);
        should(res.body.repositories[0].is_disabled).eql(false);
        should(res.body.repositories[0].is_suspicious).eql(false);
        should(res.body.repositories[0].review).eql("pending");
        should(res.body.repositories[0].is_private).eql(false);
        should(res.body.repositories[0].error_details).eql(null);
        should(res.body.repositories).be.a.Array();
        done();
      });
  });

  it("filter should give status 200 with correct response", function (done) {
    chai
      .request(app)
      .get(
        `/api/getPublicRepos?is_forked=true&is_archived=true&is_disabled=true&is_suspicious=true&review=no action&is_private=true&error_details=true`
      )
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.repositories[0].is_forked).eql(true);
        should(res.body.repositories[0].is_archived).eql(true);
        should(res.body.repositories[0].is_disabled).eql(true);
        should(res.body.repositories[0].is_suspicious).eql(true);
        should(res.body.repositories[0].review).eql("no action");
        should(res.body.repositories[0].is_private).eql(true);
        should(res.body.repositories[0].error_details).not.eql(null);
        should(res.body.repositories).be.a.Array();
        done();
      });
  });

  it("filter by repo name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/getPublicRepos?repoName=${repositoryData1.name}`)
      .end(function (err, res) {
        should(res.status).eql(200);

        should(res.body.repositories[0].name).eql(repositoryData1.name);
        should(res.body.repositories).be.a.Array();
        done();
      });
  });

  it("filter by invalid repo name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/getPublicRepos?repoName=azby`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.repositories.length).eql(0);
        should(res.body.repositories).be.a.Array();
        done();
      });
  });

  it("filter on user id and should give status 200 ", function (done) {
    chai
      .request(app)
      .get(`/api/getPublicRepos?userId=${userRes.id}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.repositories.length).eql(2);
        should(res.body.repositories).be.a.Array();
        done();
      });
  });

  it("filter on user name and should give status 200 ", function (done) {
    chai
      .request(app)
      .get(`/api/getPublicRepos?userName=${user.name}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.repositories[0].users_repositories[0].user.name).eql(
          user.name
        );
        should(res.body.repositories).be.a.Array();
        done();
      });
  });

  it("filter on invalid user name and should give status 200 ", function (done) {
    chai
      .request(app)
      .get(`/api/getPublicRepos?userName=azby`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.repositories.length).eql(0);
        should(res.body.repositories).be.a.Array();
        done();
      });
  });

  it("pass invalid user id and should give status 404 ", function (done) {
    chai
      .request(app)
      .get(`/api/getPublicRepos?userId=12234`)
      .end(function (err, res) {
        should(res.status).eql(404);
        done();
      });
  });

  it("pass invalid user id and should give status 400 ", function (done) {
    chai
      .request(app)
      .get(`/api/getPublicRepos?userId=abc`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });
});
/*eslint-disable  no-undef*/
