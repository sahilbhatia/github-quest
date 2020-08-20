const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Errors = db.user_errors;
const Users = db.users;


Errors.belongsTo(Users, { foreignKey: { name: 'user_id', allowNull: true } });
Users.hasMany(Errors, { foreignKey: { name: 'user_id', allowNull: true } });

const getForkedRepos = async (req, res) => {
    
        try {
        const data =await Errors.findAll({
            include: [
              {
                model: Users,
              },
            ]
          });
            res.status(200).json(data);
          } catch {
          res.status(500).json({
            message: "internal server error"
          });
        }
      
  }
export default getForkedRepos;
