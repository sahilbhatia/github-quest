const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const yup = require("yup");
const db = require("../../models/sequelize");
const Users = db.users;
const UsersProjects = db.users_projects;
const Projects = db.projects;
const ProjectsRepositories = db.projects_repositories;
export default async function insertUsers(req, res) {

  try {
    const data = req.body;
    console.log(req.body);
    switch (data.event_type) {

      //user update
      case "User updated":
        await yup.object().shape({
          user_id: yup
            .string()
            .required({ user_id: "required" }),
        }).validate({
          user_id: data.user_id
        }, { abortEarly: false })
          .then(async () => {
            try {
              const user = await Users.findOne({
                where: { org_user_id: data.user_id }
              })
              if (!user) {
                res.status(404).json({
                  message: "user not found"
                })
              } else {
                let updateObject = {};
                if (data.email) {
                  updateObject.email = data.email
                }
                if (data.name) {
                  updateObject.name = data.name
                }
                if (data.role) {
                  updateObject.role = data.role
                }

                if (data.public_profile) {
                  if (data.public_profile.github_handle) {
                    updateObject.github_handle = data.public_profile.github_handle
                  }
                }
                await Users.update(updateObject, {
                  where: { org_user_id: data.user_id }
                }).then(() => {
                  res.status(200).json({
                    message: "user update successfully"
                  })
                })
              }
            } catch {
              res.status(500).json({
                message: "internal server error"
              })
            }
          })
          .catch(() => {
            res.status(400).json({
              message: "user id required"
            })
          });
        break;
      //user added in project
      case "User Added":
        case "User updated":
        await yup.object().shape({
          user_id: yup
            .string()
            .required({ user_id: "required" }),
            project_id: yup
            .string()
            .required({ project_id: "required" }),
        }).validate({
          user_id: data.user_id,
          project_id:data.project_id
        }, { abortEarly: false })
          .then(async () => {
            try {
        const projectAddUser = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!projectAddUser) {
          res.status(404).json({
            message: "project not found"
          })
        } else {
          const user = await Users.findOne({
            where: { org_user_id: data.user_id }
          })
          if (!user) {
            res.status(404).json({
              message: "user not found"
            })
          } else {
            const insertObj = {
              project_id: projectAddUser.id,
              user_id: user.id
            }
           await UsersProjects.create(insertObj)
              .then(() => {
                res.status(200).json({
                  message: "added user in project successfully"
                })
              })
          }
        }
      } catch(err) {
        console.log(err)
        res.status(500).json({
          message: "internal server error"
        })
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: {err},
      })
    });
        break;
      //user removed from project
      case "User Removed":
        const projectRemoveUser = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!projectRemoveUser) {
          res.status(404).json({
            message: "project not found"
          })
        } else {
          const user = await Users.findOne({
            where: { org_user_id: data.user_id }
          })
          if (!user) {
            res.status(404).json({
              message: "user not found"
            })
          } else {
            UsersProjects.destroy({
              where: {
                project_id: projectRemoveUser.id,
                user_id: user.id
              }
            })
              .then((res) => {
                res.status(200).json({
                  message: "removed user in project successfully"
                })
              })
          }
        }

      //change project status to active 
      case "Project Active":
        const projectActive = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!projectActive) {
          res.status(404).json({
            message: "project not found"
          })
        } else {
          let projectData = { is_active: true }
          Projects.update(projectData, {
            where: { org_project_id: data.project_id }
          })
            .then((res) => {
              res.status(200).json({
                message: "project activated successfully"
              })
            })
        }

      //change project status to inactive 
      case "Project Inactive":
        const projectInactive = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!projectInactive) {
          res.status(404).json({
            message: "project not found"
          })
        } else {
          let projectData = { is_active: false }
          Projects.update(projectData, {
            where: { org_project_id: data.project_id }
          })
            .then((res) => {
              res.status(200).json({
                message: "project Inactivated successfully"
              })
            })
        }

      //project deleted 
      case "Project Deleted":
        const projectDelete = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!projectDelete) {
          res.status(404).json({
            message: "project not found"
          })
        } else {
          await UsersProjects.destroy({
            where: {
              project_id: projectDelete.id
            }
          })
          Projects.destroy(projectData, {
            where: { org_project_id: data.project_id }
          })
            .then((res) => {
              res.status(200).json({
                message: "project deleted successfully"
              })
            })
        }

      //add project manager 
      case "Manager Added":
        const projectAddManager = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!projectAddManager) {
          res.status(404).json({
            message: "project not found"
          })
        } else {
          const user = await Users.findOne({
            where: { org_user_id: data.user_id }
          })
          if (!user) {
            res.status(404).json({
              message: "user not found"
            })
          } else {
            let projectData = { project_manager: user.id }
            Projects.update(projectData, {
              where: { org_project_id: data.project_id }
            })
              .then((res) => {
                res.status(200).json({
                  message: "added project manager successfully"
                })
              })
          }
        }

      //remove project manager
      case "Manager Removed":
        const projectRemoveManager = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!projectRemoveManager) {
          res.status(404).json({
            message: "project not found"
          })
        } else {
          const user = await Users.findOne({
            where: { org_user_id: data.user_id }
          })
          if (!user) {
            res.status(404).json({
              message: "user not found"
            })
          } else {
            let projectData = { project_manager: null }
            Projects.update(projectData, {
              where: { org_project_id: data.project_id }
            })
              .then((res) => {
                res.status(200).json({
                  message: "remove project manager successfully"
                })
              })
          }
        }

      //Repository is Removed from Project
      case "Repository Removed":
        const projectRemoveRepository = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!projectRemoveRepository) {
          res.status(404).json({
            message: "project not found"
          })
        } else {
          const repo = await ProjectsRepositories.findOne({
            where: { repository_url: data.repository_url }
          })
          if (!repo) {
            res.status(404).json({
              message: "repository not found"
            })
          } else {
            ProjectsRepositories.destroy({
              where: { project_id: data.project_id, repository_url: data.repository_url }
            })
              .then((res) => {
                res.status(200).json({
                  message: "repository removed successfully"
                })
              })
          }
        }

      //Repository is Added to Project
      case "Repository Added":
        const projectAddRepository = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!projectAddRepository) {
          res.status(404).json({
            message: "project not found"
          })
        } else {
          const repoDetails = {
            repository_url: data.repository_url,
            host: data.Repository_details.host,
            project_id: data.project_id
          }
          ProjectsRepositories.create(repoDetails)
            .then((res) => {
              res.status(201).json({
                message: "repository removed successfully"
              })
            })
        }
      default:
        res.status(500).json({
          message: "internal server error"
        })
    }
  } catch{
    res.status(500).json({
      message: "internal server error"
    })
  }
}
