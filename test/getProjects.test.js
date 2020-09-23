const dbConn = require("../models/sequelize");
dbConn.sequelize;
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = require("should");
chai.use(chaiHttp);
const app = process.env.SERVER;
const db = require("../models/sequelize");
const data = require("./data");
let project = data.project;

/*eslint-disable  no-undef*/
describe("test cases for get projects api", function () {
  let projectId1, projectId2;
  before((done) => {
    project.is_active = false;
    db.projects.create(project).then((res) => {
      projectId1 = res.id;
      project.is_active = true;
      db.projects.create(project).then((res) => {
        projectId2 = res.id;
        done();
      });
    });
  });

  after(async () => {
    await db.projects.destroy({ where: { id: projectId1 } });
    await db.projects.destroy({ where: { id: projectId2 } });
  });

  it("array length should equal to limit and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/projects?limit=2")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.projects.length).eql(2);
        should(res.body.projects).be.a.Array();
        done();
      });
  });

  it("get all projects and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/projects")
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.projects).be.a.Array();
        done();
      });
  });

  it("get inactive projects and  should give status 200 with correct response", function (done) {
    chai
      .request(app)
      .get(`/api/projects?is_active=false`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.projects[0].is_active).eql(false);
        should(res.body.projects).be.a.Array();
        done();
      });
  });

  it("get active projects and should give status 200 with correct response", function (done) {
    chai
      .request(app)
      .get(`/api/projects?is_active=true`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.projects[0].is_active).eql(true);
        should(res.body.projects).be.a.Array();
        done();
      });
  });

  it("get project by project name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/projects?projectName=${project.name}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.projects[0].name).eql(project.name);
        should(res.body.projects).be.a.Array();
        done();
      });
  });

  it("get project by invalid project name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/projects?projectName=azby`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body.projects.length).eql(0);
        should(res.body.projects).be.a.Array();
        done();
      });
  });
});
/*eslint-disable  no-undef*/
