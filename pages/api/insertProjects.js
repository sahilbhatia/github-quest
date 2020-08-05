//var cron = require("node-cron");
const request = require("superagent");
const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Users = db.users;
const Projects = db.projects;
const Users_projects = db.users_projects;

export default async function insertProjects(req, res) {
  try {
    const intranetProjects = await request
      .get("https://stage-intranet.joshsoftware.com/api/v1/projects")
      .set({
        "Content-Type": "application/json",
        "Accept": "application/json"
      });

    const listOfProjects = await JSON.parse(intranetProjects.text);

    const insertUsersList = await listOfProjects.projects.map(async (item) => {

      if (item.repositories[0]) {
        const createdProject = await Projects.create({
          name: item.name ? item.name : "unknown",
          repository_url: item.repositories[0].url != 0 ? item.repositories[0].url : null,
          host: item.repositories[0].host ? item.repositories[0].host : null,
          org_project_id: item.id
        })

        if (item.active_users[0]) {

          const insertActiveUsers = await item.active_users.map(async (item) => {
            try {
              const User = await Users.findOne({
                where: {
                  org_user_id: item.id,
                }
              })
              await Users_projects.create({
                user_id: User.id,
                project_id: createdProject.id,
              })
            } catch  {
              return;
            }

          });
          await Promise.all(insertActiveUsers)
        }
      } else {
        const createdProject = await Projects.create({
          name: item.name ? item.name : "unknown",
          repository_url: null,
          host: null,
          org_project_id: item.id
        })

        if (item.active_users[0]) {

          const insertActiveUsers = await item.active_users.map(async (item) => {
            try {
              User = await Users.findOne({
                where: {
                  org_user_id: item.id,
                }
              })

              await Users_projects.create({
                user_id: User.id,
                project_id: createdProject.id,
              })
            } catch {
              return
            }
          });
          await Promise.all(insertActiveUsers)

        }
      }
    });
    await Promise.all(insertUsersList)
  } catch {
    return;
  }
}
