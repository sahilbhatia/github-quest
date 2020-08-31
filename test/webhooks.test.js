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
let project = data.project;
let project_repository = data.project_repository;

/*eslint-disable  no-undef*/
//update user
describe("test cases for web hooks to invalid event", function () {
  it("invalid event type should give status 400", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "User update",
      })
      .end(function (err, res) {
        should(res.status).eql(400);
        should(res.body).be.a.Object();
        done();
      });
  });
});

//update user
describe("test cases for web hooks to update user", function () {
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

//remove user from project
describe("test cases for web hooks to remove user from project", function () {
  let userId = user.org_user_id;
  let projectId = project.org_project_id;
  let user_id;
  let project_id;
  before((done) => {
    db.users.create(user).then((res) => {
      user_id = res.id;
      db.projects.create(project).then((res) => {
        project_id = res.id;
        db.users_projects
          .create({ user_id: user_id, project_id: project_id })
          .then(() => {
            done();
          });
      });
    });
  });

  after(async () => {
    await db.users_projects.destroy({
      where: { user_id: user_id, project_id: project_id },
    });
    await db.projects.destroy({ where: { org_project_id: projectId } });
    await db.users.destroy({ where: { org_user_id: userId } });
  });

  it("remove user from project and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "User Removed",
        user_id: userId,
        project_id: projectId,
      })
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid user id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "User Removed",
        user_id: "1a2b",
        project_id: projectId,
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid project id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "User Removed",
        user_id: userId,
        project_id: "1a2b",
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });
});

//add user in project
describe("test cases for web hooks to remove user from project", function () {
  let userId = user.org_user_id;
  let projectId = project.org_project_id;
  let user_id;
  let project_id;
  before((done) => {
    db.users.create(user).then((res) => {
      user_id = res.id;
      db.projects.create(project).then((res) => {
        project_id = res.id;
        done();
      });
    });
  });

  after(async () => {
    await db.users_projects.destroy({
      where: { user_id: user_id, project_id: project_id },
    });
    await db.projects.destroy({ where: { org_project_id: projectId } });
    await db.users.destroy({ where: { org_user_id: userId } });
  });

  it("add user in project and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "User Added",
        user_id: userId,
        project_id: projectId,
      })
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid project id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "User Added",
        user_id: userId,
        project_id: "1a2b",
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid user id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "User Added",
        user_id: "1a2b",
        project_id: projectId,
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });
});

//add project manager in project
describe("test cases for web hooks to add project manager in project", function () {
  let userId = user.org_user_id;
  let projectId = project.org_project_id;
  before((done) => {
    db.users.create(user).then(() => {
      db.projects.create(project).then(() => {
        done();
      });
    });
  });

  after(async () => {
    await db.projects.destroy({ where: { org_project_id: projectId } });
    await db.users.destroy({ where: { org_user_id: userId } });
  });

  it("add project manager in project and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Manager Added",
        user_id: userId,
        project_id: projectId,
      })
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid project id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Manager Added",
        user_id: userId,
        project_id: "1a2b",
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid user id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Manager Added",
        user_id: "1a2b",
        project_id: projectId,
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });
});

//remove project manager from project
describe("test cases for web hooks to remove project manager from project", function () {
  let userId = user.org_user_id;
  let projectId = project.org_project_id;
  before((done) => {
    db.users.create(user).then((res) => {
      project.project_manager = res.id;
      db.projects.create(project).then(() => {
        done();
      });
    });
  });

  after(async () => {
    await db.projects.destroy({ where: { org_project_id: projectId } });
    await db.users.destroy({ where: { org_user_id: userId } });
  });

  it("remove project manager from project and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Manager Added",
        user_id: userId,
        project_id: projectId,
      })
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid project id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Manager Added",
        user_id: userId,
        project_id: "1a2b",
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid user id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Manager Added",
        user_id: "1a2b",
        project_id: projectId,
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });
});

//project activate
describe("test cases for web hooks to active project", function () {
  let projectId = project.org_project_id;
  before((done) => {
    delete project.project_manager;
    db.projects.create(project).then(() => {
      done();
    });
  });

  after(async () => {
    await db.projects.destroy({ where: { org_project_id: projectId } });
  });

  it("activate project and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Project Active",
        project_id: projectId,
      })
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid project id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Project Active",
        project_id: "1a2b",
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });
});

//project Inactivate
describe("test cases for web hooks to Inactive project", function () {
  let projectId = project.org_project_id;
  before((done) => {
    delete project.project_manager;
    db.projects.create(project).then(() => {
      done();
    });
  });

  after(async () => {
    await db.projects.destroy({ where: { org_project_id: projectId } });
  });

  it("inactivate project and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Project Inactive",
        project_id: projectId,
      })
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid project id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Project Inactive",
        project_id: "1a2b",
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });
});

//project deleted
describe("test cases for web hooks to delete project", function () {
  let projectId = project.org_project_id;
  before((done) => {
    delete project.project_manager;
    db.projects.create(project).then(() => {
      done();
    });
  });

  after(async () => {
    await db.projects.destroy({ where: { org_project_id: projectId } });
  });

  it("delete project and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Project Deleted",
        project_id: projectId,
      })
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid project id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Project Deleted",
        project_id: "1a2b",
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });
});

//add repository in project
describe("test cases for web hooks to add repository in project", function () {
  let projectId = project.org_project_id;
  let project_id;
  before((done) => {
    db.projects.create(project).then((res) => {
      project_id = res.id;
      done();
    });
  });

  after(async () => {
    await db.projects_repositories.destroy({
      where: { project_id: project_id },
    });
    await db.projects.destroy({ where: { org_project_id: projectId } });
  });

  it("add repository in project and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Repository Added",
        project_id: projectId,
        repository_url: faker.internet.url(),
        Repository_details: {
          host: faker.internet.domainName(),
        },
      })
      .end(function (err, res) {
        should(res.status).eql(201);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid project id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Repository Added",
        project_id: "1a2b",
        repository_url: faker.internet.url(),
        Repository_details: {
          host: faker.internet.domainName(),
        },
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("passing null value of repository url should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Repository Added",
        project_id: projectId,
        Repository_details: {
          host: faker.internet.domainName(),
        },
      })
      .end(function (err, res) {
        should(res.status).eql(400);
        should(res.body).be.a.Object();
        done();
      });
  });
});

//add repository in project
describe("test cases for web hooks to add repository in project", function () {
  let projectId = project.org_project_id;
  let project_id;
  before((done) => {
    db.projects.create(project).then((res) => {
      project_id = res.id;
      project_repository.project_id = project_id;
      db.projects_repositories.create(project_repository).then(() => {
        done();
      });
    });
  });

  after(async () => {
    await db.projects.destroy({ where: { org_project_id: projectId } });
  });

  it("add repository in project and should give status 200", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Repository Removed",
        project_id: projectId,
        repository_url: project_repository.repository_url,
      })
      .end(function (err, res) {
        should(res.status).eql(200);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("invalid project id should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Repository Added",
        project_id: "1a2b",
        repository_url: faker.internet.url(),
      })
      .end(function (err, res) {
        should(res.status).eql(404);
        should(res.body).be.a.Object();
        done();
      });
  });

  it("passing null value of repository url should give status 404", function (done) {
    chai
      .request(app)
      .get("/api/webhooks")
      .send({
        event_type: "Repository Added",
        project_id: projectId,
      })
      .end(function (err, res) {
        should(res.status).eql(400);
        should(res.body).be.a.Object();
        done();
      });
  });
});
/*eslint-disable  no-undef*/
