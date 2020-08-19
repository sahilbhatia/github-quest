const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Users = db.users;
const UsersProjects = db.users_projects;
const Projects = db.projects;
const ProjectsRepositories = db.projects_repositories;
export default async function insertUsers(req, res) {

  try {
    const data = req.body;
    switch (data.event_type) {

      //user update
      case "User updated":
        const user = await Users.findOne({
          where: { org_user_id: data.user_id }
        })
        if (!user) {
          res.status(404).json({
            message: "user not found"
          })
        } else {
          let updateObject = {};
          if (req.body.email) {
            updateObject.email = req.body.email
          }
          if (req.body.name) {
            updateObject.name = req.body.name
          }
          if (req.body.role) {
            updateObject.role = req.body.role
          }

          if (req.body.public_profile) {
            if (req.body.public_profile.github_handle) {
              updateObject.github_handle = req.body.public_profile.github_handle
            }
          }
          Users.update(updateObject, {
            where: { org_user_id: data.user_id }
          }).then((res) => {
            res.status(200).json({
              message: "user update successfully"
            })
          })
        }

      //user added in project
      case "User Added":
        const project = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!project) {
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
              project_id: project.id,
              user_id: user.id
            }
            UsersProjects.create(insertObj)
              .then((res) => {
                res.status(200).json({
                  message: "added user in project successfully"
                })
              })
          }
        }

      //user removed from project
      case "User Removed":
        const project = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!project) {
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
                project_id: project.id,
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
        const project = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!project) {
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
        const project = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!project) {
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
        const project = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!project) {
          res.status(404).json({
            message: "project not found"
          })
        } else {
          await UsersProjects.destroy({
            where: {
              project_id: project.id
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
        const project = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!project) {
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
        const project = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!project) {
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
        const project = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!project) {
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
        const project = await Projects.findOne({
          where: { org_project_id: data.project_id }
        })
        if (!project) {
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
