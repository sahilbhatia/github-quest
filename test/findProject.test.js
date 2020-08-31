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
describe("test cases for find user api", function () {
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

  it("should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/findProject")
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("find by project name should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/findProject?projectName=${project.name}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Array();
        done();
      });
  });
});
/*eslint-disable  no-undef*/
