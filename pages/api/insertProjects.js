var cron = require("node-cron");
const request = require("superagent");
const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Users = db.users;
const Projects = db.projects;
const Projects_Repositories = db.projects_repositories;
const Users_projects = db.users_projects;

export default async function insertProjects(req, res) {
  const addProjects = async () => {
    try {
      const intranetProjects = await request
        .get("https://stage-intranet.joshsoftware.com/api/v1/projects")
        .set({
          "Content-Type": "application/json",
          "Accept": "application/json"
        });
      const listOfProjects = await JSON.parse(intranetProjects.text);

      const insertUsersList = await listOfProjects.projects.map(async (item) => {
        const findProject = await Projects.findOne({
          where: {
            org_project_id: item.id
          }
        })
        if (!findProject) {

          if (item.repositories[0]) {

            const createdProject = await Projects.create({
              name: item.name ? item.name : "unknown",
              org_project_id: item.id
            })

            await item.repositories.map(async (item) => {
              await Projects_Repositories.create({
                repository_url: item.url ? item.url : null,
                host: item.host ? item.host : null,
                project_id: createdProject.id
              })
            });

            if (item.active_users.length > 0) {
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
              org_project_id: item.id
            })
            const projects_repositories = await Projects_Repositories.create({
              repository_url: null,
              host: null,
              project_id: createdProject.id
            })

            if (item.active_users.length > 0) {

              const insertActiveUsers = await item.active_users.map(async (item) => {
                try {
                  let user = await Users.findOne({
                    where: {
                      org_user_id: item.id,
                    }
                  })

                  await Users_projects.create({
                    user_id: user.id,
                    project_id: createdProject.id,
                  })
                } catch {
                  return
                }
              });
              await Promise.all(insertActiveUsers)
            }
          }
        }
      });
      await Promise.all(insertUsersList)
    } catch {
      return;
    }
  }
  cron.schedule(process.env.INSERT_PROJECTS_SCHEDULE, async () => {
    addProjects();
  });

  addProjects();
  res.status(200).json({
    message: "cron Job Activated successfully for inserting projects"
  })
}
