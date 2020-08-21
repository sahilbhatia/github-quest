const dbConn = require("../models/sequelize");
dbConn.sequelize;
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = require('should');
chai.use(chaiHttp);
const app = "http://localhost:3000";//require("../server");
const db = require("../models/sequelize");
const data = require("./data");

let user = data.user;

describe("test cases for web hooks", function () {
  let userId = user.org_user_id;
  before((done) => {
    db.users.create(user).then(() => {
      done();
    });
  });

  after(async () => {
    await db.users.destroy({ where: { org_user_id: userId } });
  });

  it("update user and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "User updated",
        user_id: userId,
        name: "xyz",
      })
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid event type should give status 400", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "User update",
        user_id: userId,
        name: "xyz",
      })
      .end(function (err, res) {
        should(res.status).eql(400);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid user id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "User updated",
        user_id: "1a2b",
        name: "xyz",
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });
});  
