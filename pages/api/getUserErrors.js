const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Users = db.users;
const Sequelize = require("sequelize");

const getForkedRepos = async (req, res) => {
    
        try {
        const data =await Users.findAll({
            where:{
              error_details : {[Sequelize.Op.ne]: null},
            }
          });
            res.status(200).json(data);
          } catch {
          res.status(500).json({
            message: "internal server error"
          });
        }
  }
export default getForkedRepos;
