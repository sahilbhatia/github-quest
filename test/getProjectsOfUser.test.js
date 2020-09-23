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

/*eslint-disable  no-undef*/
describe("test cases for get projects of api", function () {
  let userId;
  before((done) => {
    db.users.create(user).then((res) => {
      userId = res.id;
      done();
    });
  });

  after(async () => {
    await db.users.destroy({ where: { id: userId } });
  });

  it("get projects by user id and should give status 200", function (done) {
    chai
      .request(app)
      .get(`/api/user-projects?userId=${userId}`)
      .end(function (err, res) {
        should(res.status).eql(200);
        done();
      });
  });

  it("get projects by invalid user id and should give status 400", function (done) {
    chai
      .request(app)
      .get(`/api/user-projects?userId=azby12`)
      .end(function (err, res) {
        should(res.status).eql(400);
        done();
      });
  });

  it("get projects by invalid user id and should give status 404", function (done) {
    chai
      .request(app)
      .get(`/api/user-projects?userId=12345`)
      .end(function (err, res) {
        should(res.status).eql(404);
        done();
      });
  });
});
/*eslint-disable  no-undef*/
