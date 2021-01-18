const request = require("superagent");
const dbConn = require("../models/sequelize");
const { headers } = require("../constants/intranetHeader");
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();
dbConn.sequelize;
const db = require("../models/sequelize");
const Users = db.users;
const Projects = db.projects;
const Projects_Repositories = db.projects_repositories;
const Users_projects = db.users_projects;

//function for insert repositories
const insertRepository = async (item, projectId) => {
  if (item.repositories.length > 0) {
    await item.repositories.map(async (item) => {
      try {
        await Projects_Repositories.create({
          repository_url: item.url ? item.url : null,
          host: item.host ? item.host : null,
          project_id: projectId,
        });
      } catch (err) {
        Sentry.captureException(err);
        logger.error(
          "Error executing while fetching projects in insert repository function"
        );
        logger.error(err);
        logger.info("=========================================");
        return false;
      }
    });
  }
};

//function for insert users
const insertUsers = async (item, projectId) => {
  if (item.active_users.length > 0) {
    await item.active_users.map(async (item) => {
      try {
        const User = await Users.findOne({
          where: {
            org_user_id: item.id,
          },
        });
        if (User) {
          await Users_projects.create({
            user_id: User.id,
            project_id: projectId,
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error(
          "Error executing while fetching projects in insert users function"
        );
        logger.error(err);
        logger.info("=========================================");
        return false;
      }
    });
  }
};

//function for find project
const findProject = async (id) => {
  try {
    const project = await Projects.findOne({
      where: {
        org_project_id: id,
      },
    });
    if (!project) {
      return false;
    } else {
      return project;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while fetching projects in find project function"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//function for find project
const getProjectManager = async (item) => {
  if (item.manager_ids.length != 0) {
    try {
      const user = await Users.findOne({
        where: {
          org_user_id: item.manager_ids[0],
        },
      });
      if (!user) {
        return null;
      } else {
        return user.id;
      }
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  } else {
    return null;
  }
};

//function for insert projects
const addProject = async (item) => {
  try {
    const projectManager = await getProjectManager(item);
    const insertProject = await Projects.create({
      name: item.name ? item.name : "unknown",
      org_project_id: item.id,
      is_active: item.is_active,
      project_manager: projectManager,
      created_at: item.created_at,
      updated_at: item.updated_at,
    });
    return insertProject;
  } catch (err) {
    Sentry.captureException(err);
    return null;
  }
};

//function for get projects from database
const getProjects = async () => {
  try {
    const projects = [];
    const listOfProjects = await Projects_Repositories.findAll();
    listOfProjects.map((item) => {
      if (item.dataValues) {
        if (item.dataValues.repository_url != null) {
          projects.push(item.dataValues);
        }
      }
    });
    return projects;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing in fetch projects function while iterating projects from database"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//function for compare the public repositories and project repositories and avoid dublicates entries
const removeDuplicatesRepositories = async () => {
  await getProjects();
};

//function for cron schedule
module.exports.addProjects = async () => {
  try {
    const intranetProjects = await request
      .get(process.env.INTRANET_PROJECT_API)
      .set(headers);

    const listOfProjects = await JSON.parse(intranetProjects.text);
    //iterate projects
    const data = await listOfProjects.projects.map(async (item) => {
      const project = await findProject(item.id);
      if (!project) {
        try {
          const insertProject = await addProject(item);
          if (insertProject) {
            await insertRepository(item, insertProject.id);
            await insertUsers(item, insertProject.id);
          }
        } catch (err) {
          Sentry.captureException(err);
          logger.error(
            "Error executing in fetch projects function while iterating projects in API call"
          );
          logger.error(err);
          logger.info("=========================================");
          return false;
        }
      }
    });
    await Promise.all(data);
    return null;
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing while fetching projects");
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//function for insert intranet projects
module.exports.addIntranetProjects = async (res) => {
  try {
    const intranetProjects = await request
      .get(process.env.INTRANET_PROJECT_API)
      .set(headers);

    const listOfProjects = await JSON.parse(intranetProjects.text);
    //iterate projects
    const data = await listOfProjects.projects.map(async (item) => {
      const project = await findProject(item.id);
      if (!project) {
        try {
          const insertProject = await addProject(item);
          if (insertProject) {
            await insertRepository(item, insertProject.id);
            await insertUsers(item, insertProject.id);
          }
        } catch (err) {
          Sentry.captureException(err);
          logger.error(
            "Error executing in fetch projects function while iterating projects in API call"
          );
          logger.error(err);
          logger.info("=========================================");
          return false;
        }
      }
    });
    await Promise.all(data);
    await removeDuplicatesRepositories();
    res.status(200).json({
      message: "Cron Job Activated Successfully For Inserting Projects",
    });
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing while fetching projects in API call");
    logger.error(err);
    logger.info("=========================================");
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
