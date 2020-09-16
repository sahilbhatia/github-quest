var cron = require("node-cron");
const request = require("superagent");
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const Projects = db.projects;
const Projects_Repositories = db.projects_repositories;
const Users_projects = db.users_projects;

export default async function insertProjects(req, res) {
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

  //function for insert intranet projects
  const addProjects = async () => {
    try {
      const intranetProjects = await request
        .get("https://stage-intranet.joshsoftware.com/api/v1/projects")
        .set({
          "Content-Type": "application/json",
          Accept: "application/json",
        });
      const listOfProjects = await JSON.parse(intranetProjects.text);

      //insert projects
      await listOfProjects.projects.map(async (item) => {
        const findProject = await Projects.findOne({
          where: {
            org_project_id: item.id,
          },
        });
        if (!findProject) {
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
    } catch {
      return false;
    }
  };

  //cron scheduler
  cron.schedule(process.env.INSERT_PROJECTS_SCHEDULE, async () => {
    addProjects();
  });

  addProjects();
  res.status(200).json({
    message: "cron Job Activated successfully for inserting projects",
  });
}