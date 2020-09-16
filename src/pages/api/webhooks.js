const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const webHooks = require("../utils/webHookFunctions");

export default async function insertUsers(req, res) {
  try {
    const data = req.body;
    switch (data.event_type) {
      //user update
      case "User Updated":
        await webHooks.updateUser(res, data);
        break;

      //user added in project
      case "User Added":
        await webHooks.addUserInProject(res, data);
        break;

      //user removed from project
      case "User Removed":
        await webHooks.removeUserFromProject(res, data);
        break;

      //change project status to active
      case "Project Active":
        await webHooks.changeStatusOfProject(res, data, true);
        break;

      //change project status to inactive
      case "Project Inactive":
        await webHooks.changeStatusOfProject(res, data, false);
        break;

      //project deleted
      case "Project Deleted":
        await webHooks.deleteProject(res, data);
        break;

      //add project manager
      case "Manager Added":
        await webHooks.addManagerInProject(res, data);
        break;

      //remove project manager
      case "Manager Removed":
        await webHooks.removeManagerFromProject(res, data);
        break;

      //Repository is Removed from Project
      case "Repository Removed":
        await webHooks.removeRepositoryFromProject(res, data);
        break;

      //Repository is Added to Project
      case "Repository Added":
        await webHooks.addRepositoryInProject(res, data);
        break;

      default:
        res.status(400).json({
          message: "Invalid Event Hook",
        });
        break;
    }
  } catch {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
