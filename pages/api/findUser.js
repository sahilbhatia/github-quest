const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Users = db.users;
const yup = require("yup");
const Sequelize = require("sequelize");
const findUser = async (req, res) => {
  try {
    const userName = req.query.userName;
    const githubHandle = req.query.githubHandle;
    const userId = req.query.userId;
    if (userName) {
      let userList = await Users.findAll({
        where: {
          name: {
            [Sequelize.Op.iLike]: "%" + userName + "%",
          },
        }
      })
      res.status(200).json(userList);
    }
    if (githubHandle) {
      let userList = await Users.findAll({
        where: {
          github_handle: {
            [Sequelize.Op.iLike]: "%" + githubHandle + "%",
          },
        }
      })
      res.status(200).json(userList);
    }
    if (userId) {
      await yup.object().shape({
        userId: yup
          .number()
          .required({ repoId: "required" }),
      }).validate({
        userId: userId
      }, { abortEarly: false })
        .then(async () => {
          let userList = await Users.findOne({
            where: {
              id: userId
            }
          });
          res.status(200).json(userList);
        })
        .catch(() => {
          res.status(400).json({
            message: "user Id must be number"
          })
        });
    }
  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
}

export default findUser;
