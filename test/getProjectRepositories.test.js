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
describe("test cases for get project repositories api", function () {
  let projectId;

  before((done) => {
    db.projects.create(project).then((res) => {
      projectId = res.id;
      done();
    });
  });

  after(async () => {
    await db.projects.destroy({ where: { id: projectId } });
  });

  it("find repositories of project should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/project-repositories?projectId=${projectId}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("find repositories of invalid project id should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/project-repositories?projectId=azby12`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });

  it("find repositories of invalid project id should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/project-repositories?projectId=12345`)
      .end(function (err, res) {
        should(res.status).eql(404);
        done();
      });
  });
});
/*eslint-disable  no-undef*/
