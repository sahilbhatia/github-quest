const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const Projects = db.projects;
const Users_projects = db.users_projects;
const Repositories = db.repositories;

export default async function updateProject(req, res) {
  try {
    const getUpdateRepos = async (projectId) => {
      let differentProject = false;
      const RepoCount = await Repositories.findAll({
        where: {
          project_id: projectId
        }
      })
      await req.body.repositories.map(async (item) => {

        const projectData = await Repositories.findOne({
          where: {
            repository_url: item.url,
            host: item.host,
          }
        })
        if (!projectData) {
          differentProject = true;
        }
      });

      if (req.body.repositories.length == RepoCount.length && differentProject == false) {
        return false;
      } else {
        return true;
      }
    }

    const getUpdatedUsers = async (projectId) => {
      let differentUsers = false;
      const findOne = await Users_projects.findOne({
        where: {
          project_id: projectId,
        }
      })

      const usersCount = await Users_projects.findAll({
        where: {
          project_id: projectId,
        }
      })

      await req.body.active_users.map(async (item) => {
        const User = await Users.findOne({
          where: {
            org_user_id: item.id,
          }
        })

        const UserData = await Users_projects.findOne({
          where: {
            user_id: User.id,
            project_id: projectId,
          }
        })

        if (!UserData) {
          differentUsers = true;
        }
      });
      if (req.body.active_users.length == usersCount.length && differentUsers == false) {
        return false;
      } else {
        return true;
      }
    }

    const projectData = await Projects.findOne({
      where: {
        org_project_id: req.query.id,
      }
    })

    await Projects.update({
      name: req.body.name,
    }, {
      returning: true,
      plain: true,
      where: {
        org_project_id: req.query.id,
      }
    })

    if (req.body.repositories[0]) {
      const returnFlag = await getUpdateRepos(projectData.id);
      if (returnFlag) {
        await Repositories.destroy({
          where: {
            project_id: projectData.id
          }
        })
        await req.body.repositories.map(async (item) => {
          await Repositories.create({
            repository_url: item.url ? item.url : null,
            host: item.host ? item.host : null,
            project_id: projectData.id
          })
        });
      }
    }
    else {
      await Repositories.destroy({
        where: {
          project_id: projectData.id
        }
      })
    }

    if (req.body.active_users[0]) {

      const returnFlag = await getUpdatedUsers(projectData.id);

      if (returnFlag) {
        await Users_projects.destroy({
          where: {
            project_id: projectData.id
          }
        })
        const insertActiveUsers = await req.body.active_users.map(async (item) => {
          try {
            const User = await Users.findOne({
              where: {
                org_user_id: item.id,
              }
            })
            await Users_projects.create({
              user_id: User.id,
              project_id: projectData.id,
            })
          } catch {
            return;
          }
        });
        await Promise.all(insertActiveUsers)
      }
    } else {
      await Users_projects.destroy({
        where: {
          project_id: projectData.id
        }
      })
    }
    res.status(200).json({
      message: "user updated successfuly",
    })

  } catch {
    res.status(500).json({
      message: "internal server error",
    })
  }
}
