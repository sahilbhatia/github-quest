const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const Sequelize = require("sequelize");
const findUsers = async (req, res) => {
  const userName = req.query.userName;
  const usersList = await Users.findAll({
    where: {
      [Sequelize.Op.or]: {
        name: {
          [Sequelize.Op.iLike]: "%" + userName + "%",
        },
      },
    }
  })
  res.status(200).json(usersList);
}

export default findUsers;
