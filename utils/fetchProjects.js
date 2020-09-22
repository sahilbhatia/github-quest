const request = require("superagent");
const dbConn = require("../models/sequelize");
dbConn.sequelize;
const db = require("../models/sequelize");
const Users = db.users;
const Projects = db.projects;
const Projects_Repositories = db.projects_repositories;
const Users_projects = db.users_projects;

//function for insert repositories
const insertRepository = async (item, projectId) => {
  if (item.repositories.length > 0) {
    await item.repositories.map(async (item) => {
      try {
        await Projects_Repositories.create({
          repository_url: item.url ? item.url : null,
          host: item.host ? item.host : null,
          project_id: projectId,
        });
      } catch {
        return false;
      }
    });
  }
};

//function for insert users
const insertUsers = async (item, projectId) => {
  if (item.active_users.length > 0) {
    await item.active_users.map(async (item) => {
      try {
        const User = await Users.findOne({
          where: {
            org_user_id: item.id,
          },
        });
        if (User) {
          await Users_projects.create({
            user_id: User.id,
            project_id: projectId,
          });
        }
      } catch {
        return false;
      }
    });
  }
};

//function for find project
const findProject = async (id) => {
  try {
    const project = await Projects.findOne({
      where: {
        org_project_id: id,
      },
    });
    if (!project) {
      return false;
    } else {
      return project;
    }
  } catch {
    return false;
  }
};

//function for insert intranet projects
module.exports.addProjects = async () => {
  try {
    const intranetProjects = await request
      .get("https://stage-intranet.joshsoftware.com/api/v1/projects")
      .set({
        "Content-Type": "application/json",
        Accept: "application/json",
      });

    const listOfProjects = await JSON.parse(intranetProjects.text);
    //iterate projects
    const data = await listOfProjects.projects.map(async (item) => {
      const project = await findProject(item.id);
      if (!project) {
        try {
          const insertProject = await Projects.create({
            name: item.name ? item.name : "unknown",
            org_project_id: item.id,
          });
          await insertRepository(item, insertProject.id);
          await insertUsers(item, insertProject.id);
        } catch {
          return false;
        }
      }
    });
    await Promise.all(data);
    return null;
  } catch {
    return false;
  }
};
