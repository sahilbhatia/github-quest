import { projects } from "../../models/sequelize";

const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Users = db.users;
const UsersProjects = db.users_projects;
const Projects = db.projects;
export default async function insertUsers(req, res) {

  try {
    const data = req.body;
    switch (data.event_type) {
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
              where:{
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

      default:
        break;

    }
  } catch{
    res.status(500).json({
      message: "internal server error"
    })
  }
}
