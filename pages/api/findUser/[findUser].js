const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const Sequelize = require("sequelize");
const findUser = async (req, res) => {
  const userName = req.query.userName;
  const userList = await Users.findAll({
    where: {
        name: {
          [Sequelize.Op.iLike]: "%" + userName + "%",
        },
    }
  })
  res.status(200).json(userList);
}

export default findUser;
