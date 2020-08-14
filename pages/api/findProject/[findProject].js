const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Projects = db.projects;
const Sequelize = require("sequelize");
const findProject = async (req, res) => {
  try{
  const projectName = req.query.projectName;
  const projectList = await Projects.findAll({
    where: {
        name: {
          [Sequelize.Op.iLike]: "%" + projectName + "%",
        },
    }
  })
  res.status(200).json(projectList);
}catch{
  res.status(500).json({
    message: "internal server error"
  })
}
}

export default findProject;
