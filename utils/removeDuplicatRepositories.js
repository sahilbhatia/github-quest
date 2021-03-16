const dbConn = require("../models/sequelize");
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();
dbConn.sequelize;
const db = require("../models/sequelize");
const Users = db.users;
const Projects_Repositories = db.projects_repositories;
const Repositories = db.repositories;
const Users_Repositories = db.users_repositories;

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
      "Error executing in remove duplicate repositories function while iterating projects from database"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
//function for get all public repo of one user
const getRepositoriesIdsByUserId = async (userId) => {
  try {
    const repositoriesIds = [];
    const listOfUsersRepositories = await Users_Repositories.findAll({
      where: {
        user_id: userId,
      },
    });
    listOfUsersRepositories.map((item) => {
      if (item.dataValues) {
        repositoriesIds.push(item.dataValues.repository_id);
      }
    });
    return repositoriesIds;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing in remove duplicate repositories function while getting Users_Repositories list user id from database"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
//function for get all public repo by array of repositoryId
const getPublicRepositoriesByIds = async (repositoryIds) => {
  try {
    const repositories = [];
    const listOfPublicRepositories = await Repositories.findAll({
      where: {
        id: repositoryIds,
        is_private: "f",
      },
    });
    listOfPublicRepositories.map((item) => {
      if (item.dataValues) {
        if (item.dataValues.url != null) {
          repositories.push(item.dataValues);
        }
      }
    });
    return repositories;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing in remove duplicate repositories function while iterating repositories by id from database"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//function for get project info by project repo url
const getInfoByProjectUrl = (url) => {
  let project = {};
  const splitArray = url.split("/");
  if (splitArray.length > 4) {
    let sourceType = splitArray[2].split(".")[0];
    if (
      sourceType.localeCompare("github") ||
      sourceType.localeCompare("bitbucket") ||
      sourceType.localeCompare("gitlab")
    ) {
      project.sourceType = sourceType;
      project.handle = splitArray[3];
      project.repositorieName = splitArray[4];
      return project;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
//function return a query for find user base on handle
const getUserQueryBYHandle = (project) => {
  let query = {};
  if (project.sourceType === "github") {
    query.github_handle = project.handle;
  } else if (project.sourceType === "gitlab") {
    query.gitlab_handle = project.handle;
  } else if (project.sourceType === "bitbucket") {
    query.bitbucket_handle = project.handle;
  }
  return query;
};

// function for get a repositores by user has equal hangle as a project handle
const getRepoListByProjectHandle = async (project) => {
  try {
    let query = getUserQueryBYHandle(project);
    const user = await Users.findOne({
      where: query,
      attributes: ["id"],
    });
    if (user == null) {
      return false;
    }
    let RepositoryIds = await getRepositoriesIdsByUserId(user.dataValues.id);
    let listOfRepository = await getPublicRepositoriesByIds(RepositoryIds);
    return listOfRepository;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing in remove duplicates repositories function while get repository list by project hanlde"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
//function for delete a duplicate entry in repositories and user_repositories
const deleteDuplicateEntry = async (repositoryId) => {
  try {
    await Users_Repositories.destroy({
      where: {
        repository_id: repositoryId,
      },
    });
    await Repositories.destroy({
      where: {
        id: repositoryId,
      },
    });
    return true;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing in remove duplicates repositories function while deleting the entries in database"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
//function for compare the public repositories and project repositories and avoid dublicates entries
module.exports.removeDuplicatesRepositories = async () => {
  const listOfProjects = await getProjects();
  try {
    const data = await listOfProjects.map(async (item) => {
      const project = getInfoByProjectUrl(item.repository_url);
      if (project) {
        const listOfUserRepositories = await getRepoListByProjectHandle(
          project
        );
        if (listOfUserRepositories) {
          const repoData = await listOfUserRepositories.map(async (item) => {
            if (
              project.sourceType == item.source_type &&
              project.repositorieName == item.name
            ) {
              await deleteDuplicateEntry(item.id);
            }
          });
          await Promise.all(repoData);
        }
      }
    });
    await Promise.all(data);
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing in remove duplicates repositories function");
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
