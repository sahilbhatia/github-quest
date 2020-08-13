const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const Sequelize = require("sequelize");
const findUser = async (req, res) => {
  try{
  const userName = req.query.userName;
  const githubHandle = req.query.githubHandle;
  const userId = req.query.userId;
  let userList;
  if (userName) {
    userList = await Users.findAll({
      where: {
        name: {
          [Sequelize.Op.iLike]: "%" + userName + "%",
        },
      }
    })
  }
  if (githubHandle) {
    userList = await Users.findAll({
      where: {
        github_handle: {
          [Sequelize.Op.iLike]: "%" + githubHandle + "%",
        },
      }
    })
  }
  if (userId) {
    userList = await Users.findOne({
      where: {
        id: userId
      }
    })
  }
  res.status(200).json(userList);
} catch {
  res.status(500).json({
    message: "internal server error"
  })
}
}

export default findUser;
