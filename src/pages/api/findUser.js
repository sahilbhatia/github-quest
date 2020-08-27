const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
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
    } else if (githubHandle) {
      let userList = await Users.findAll({
        where: {
          github_handle: {
            [Sequelize.Op.iLike]: "%" + githubHandle + "%",
          },
        }
      })
      res.status(200).json(userList);
    } else if (userId) {
      await yup.object().shape({
        userId: yup
          .number()
          .required({ userId: "required" }),
      }).validate({
        userId: userId
      }, { abortEarly: false })
        .then(async () => {
          let user = await Users.findOne({
            where: {
              id: userId
            }
          });
          if (user) {
            res.status(200).json(user);
          } else {
            res.status(404).json({
              message: "user not found for given id"
            })
          }
        })
        .catch(() => {
          res.status(400).json({
            message: "user Id must be number"
          })
        });
    } else {
      res.status(400).json({
        message: "key value required"
      })
    }
  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
}

export default findUser;
