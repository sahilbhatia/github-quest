const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;

export default async function updateUsers(req, res) {
  try {
    const Data=await Users.findOne({
      where: {
        org_user_id: req.query.id,
      }
    })
    if(!Data){
      res.status(404).json({
        message: "User not found",
      })
    } else {
    const getUpdateUser = () => {
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
      return updateObject;
    }
    const getObject = await getUpdateUser();
    await Users.update(getObject, {
      where: {
        org_user_id: req.query.id,
      }
    })

    res.status(200).json({
      message: "user updated successfuly",
    })
  }
  } catch {
    res.status(500).json({
      message: "internal server error",
    })
  }
}
