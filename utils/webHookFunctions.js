const dbConn = require("../models/sequelize");
dbConn.sequelize;
const db = require("../models/sequelize");
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();
const Users = db.users;
const UsersProjects = db.users_projects;
const Projects = db.projects;
const ProjectsRepositories = db.projects_repositories;
const validation = require("./validationSchema");
const userSchema = validation.userIdSchema();
const projectSchema = validation.projectIdSchema();
const userProjectSchema = validation.userProjectSchema();
const repositoryRemoveSchema = validation.repositoryRemoveSchema();
const repositoryInsertSchema = validation.repositoryInsertSchema();
const {
  INTERNAL_SERVER_ERROR,
  User_NOT_FOUND,
  VALIDATION_ERROR,
  PROJECT_NOT_FOUND,
  PROJECT_ACTIVATED,
  PROJECT_INACTIVATED,
  PROJECT_DELETED,
  REPOSITORY_ADDED,
  REPOSITORY_REMOVED,
  MANAGER_ADDED,
  MANAGER_REMOVED,
  MANAGER_NOT_FOUND,
  USER_ADDED,
  USER_REMOVED,
  REPOSITORY_NOT_FOUND,
  USER_UPDATED,
} = require("../../../constants/responseConstants");

//find user
const findUser = async (id) => {
  try {
    const user = await Users.findOne({
      where: { org_user_id: id },
    });
    if (!user) {
      return false;
    } else {
      return user;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing in find user function of webhook function");
    logger.error(err);
    logger.info("=========================================");
    throw err;
  }
};

//find manager
const findManager = async (userId, projectId) => {
  try {
    const manager = await Projects.findOne({
      where: { org_project_id: projectId, project_manager: userId },
    });
    if (!manager) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing in find manager function of webhook function"
    );
    logger.error(err);
    logger.info("=========================================");
    throw err;
  }
};

//find project
const findProject = async (id) => {
  try {
    const project = await Projects.findOne({
      where: { org_project_id: id },
    });
    if (!project) {
      return false;
    } else {
      return project;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing in find project function of webhook function"
    );
    logger.error(err);
    logger.info("=========================================");
    throw err;
  }
};

//find repository
const findRepository = async (url) => {
  try {
    const repo = await ProjectsRepositories.findOne({
      where: { repository_url: url },
    });
    if (!repo) {
      return false;
    } else {
      return repo;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing in find repository function of webhook function"
    );
    logger.error(err);
    logger.info("=========================================");
    throw err;
  }
};

//function for get updated info
const getUpdateObj = (data) => {
  if (data.public_profile_details) {
    let updateObject = {
      email: data.email,
      name: data.name,
      role: data.role,
      github_handle: data.public_profile_details.github_handle,
      gitlab_handle: data.public_profile_details.gitlab_handle,
      bitbucket_handle: data.public_profile_details.bitbucket_handle,
    };
    return updateObject;
  } else {
    let updateObject = {
      email: data.email,
      name: data.name,
      role: data.role,
    };
    return updateObject;
  }
};

//update user information
module.exports.updateUser = async (res, data) => {
  await userSchema
    .validate({
      user_id: data.user_id,
    })
    .then(async () => {
      try {
        const user = await findUser(data.user_id);
        if (!user) {
          res.status(404).json(User_NOT_FOUND);
        } else {
          let updateObject = getUpdateObj(data);
          await Users.update(updateObject, {
            where: { org_user_id: data.user_id },
          });
          res.status(200).json(USER_UPDATED);
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in update user webhook");
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json(INTERNAL_SERVER_ERROR);
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      VALIDATION_ERROR.errors = err.errors;
      res.status(400).json(VALIDATION_ERROR);
    });
};

//add user in project
module.exports.addUserInProject = async (res, data) => {
  await userProjectSchema
    .validate(
      {
        user_id: data.user_id,
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const project = await findProject(data.project_id);
        if (!project) {
          res.status(404).json(PROJECT_NOT_FOUND);
        } else {
          const user = await findUser(data.user_id);
          if (!user) {
            res.status(404).json(User_NOT_FOUND);
          } else {
            const insertObj = {
              project_id: project.id,
              user_id: user.id,
            };
            await UsersProjects.create(insertObj);
            res.status(200).json(USER_ADDED);
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in add user in project webhook");
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json(INTERNAL_SERVER_ERROR);
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      VALIDATION_ERROR.errors = err.errors;
      res.status(400).json(VALIDATION_ERROR);
    });
};

//remove user from project
module.exports.removeUserFromProject = async (res, data) => {
  await userProjectSchema
    .validate(
      {
        user_id: data.user_id,
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const project = await findProject(data.project_id);
        if (!project) {
          res.status(404).json(PROJECT_NOT_FOUND);
        } else {
          const user = await findUser(data.user_id);
          if (!user) {
            res.status(404).json(User_NOT_FOUND);
          } else {
            await UsersProjects.destroy({
              where: {
                project_id: project.id,
                user_id: user.id,
              },
            });
            res.status(200).json(USER_REMOVED);
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in remove user from project webhook");
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json(INTERNAL_SERVER_ERROR);
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      VALIDATION_ERROR.errors = err.errors;
      res.status(400).json(VALIDATION_ERROR);
    });
};

//change project status
module.exports.changeStatusOfProject = async (res, data, is_active) => {
  await projectSchema
    .validate({
      project_id: data.project_id,
    })
    .then(async () => {
      try {
        const project = await findProject(data.project_id);
        if (!project) {
          res.status(404).json(PROJECT_NOT_FOUND);
        } else {
          let projectData = { is_active: is_active };
          await Projects.update(projectData, {
            where: { org_project_id: data.project_id },
          });
          if (is_active) {
            res.status(200).json(PROJECT_ACTIVATED);
          } else {
            res.status(200).json(PROJECT_INACTIVATED);
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in change project status webhook");
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json(INTERNAL_SERVER_ERROR);
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      VALIDATION_ERROR.errors = err.errors;
      res.status(400).json(VALIDATION_ERROR);
    });
};

//project deleted
module.exports.deleteProject = async (res, data) => {
  await projectSchema
    .validate({
      project_id: data.project_id,
    })
    .then(async () => {
      try {
        const project = await findProject(data.project_id);
        if (!project) {
          res.status(404).json(PROJECT_NOT_FOUND);
        } else {
          await UsersProjects.destroy({
            where: {
              project_id: project.id,
            },
          });
          await ProjectsRepositories.destroy({
            where: {
              project_id: project.id,
            },
          });
          await Projects.destroy({
            where: { org_project_id: data.project_id },
          });
          res.status(200).json(PROJECT_DELETED);
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in delete project webhook");
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json(INTERNAL_SERVER_ERROR);
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      VALIDATION_ERROR.errors = err.errors;
      res.status(400).json(VALIDATION_ERROR);
    });
};

//add project manager
module.exports.addManagerInProject = async (res, data) => {
  await userProjectSchema
    .validate(
      {
        user_id: data.user_id,
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const project = await findProject(data.project_id);
        if (!project) {
          res.status(404).json(PROJECT_NOT_FOUND);
        } else {
          const user = await findUser(data.user_id);
          if (!user) {
            res.status(404).json(User_NOT_FOUND);
          } else {
            let projectData = { project_manager: user.id };
            await Projects.update(projectData, {
              where: { org_project_id: data.project_id },
            });
            res.status(200).json(MANAGER_ADDED);
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in add manger in project webhook");
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json(INTERNAL_SERVER_ERROR);
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      VALIDATION_ERROR.errors = err.errors;
      res.status(400).json(VALIDATION_ERROR);
    });
};

//remove project manager
module.exports.removeManagerFromProject = async (res, data) => {
  await userProjectSchema
    .validate(
      {
        user_id: data.user_id,
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const project = await findProject(data.project_id);
        if (!project) {
          res.status(404).json(PROJECT_NOT_FOUND);
        } else {
          const user = await findUser(data.user_id);
          if (!user) {
            res.status(404).json(User_NOT_FOUND);
          } else {
            const manager = await findManager(user.id, data.project_id);
            if (!manager) {
              res.status(404).json(MANAGER_NOT_FOUND);
            } else {
              let projectData = { project_manager: null };
              await Projects.update(projectData, {
                where: { org_project_id: data.project_id },
              });
              res.status(200).json(MANAGER_REMOVED);
            }
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in remove manger from project webhook");
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json(INTERNAL_SERVER_ERROR);
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      VALIDATION_ERROR.errors = err.errors;
      res.status(400).json(VALIDATION_ERROR);
    });
};

//Repository is Removed from Project
module.exports.removeRepositoryFromProject = async (res, data) => {
  await repositoryRemoveSchema
    .validate(
      {
        project_id: data.project_id,
        repository_url: data.repository_url,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const project = await findProject(data.project_id);
        if (!project) {
          res.status(404).json(PROJECT_NOT_FOUND);
        } else {
          const repo = await findRepository(data.repository_url);
          if (!repo) {
            res.status(404).json(REPOSITORY_NOT_FOUND);
          } else {
            await ProjectsRepositories.destroy({
              where: {
                project_id: project.id,
                repository_url: data.repository_url,
              },
            }).then(() => {
              res.status(200).json(REPOSITORY_REMOVED);
            });
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error(
          "Error executing in remove repository from project webhook"
        );
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json(INTERNAL_SERVER_ERROR);
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      VALIDATION_ERROR.errors = err.errors;
      res.status(400).json(VALIDATION_ERROR);
    });
};

//Repository is Added to Project
module.exports.addRepositoryInProject = async (res, data) => {
  await repositoryInsertSchema
    .validate(
      {
        project_id: data.project_id,
        repository_url: data.repository_url,
        repository_details: data.repository_details,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const project = await findProject(data.project_id);
        if (!project) {
          res.status(404).json(PROJECT_NOT_FOUND);
        } else {
          const repoDetails = {
            repository_url: data.repository_url,
            host: data.repository_details.host,
            project_id: project.id,
          };
          await ProjectsRepositories.create(repoDetails).then(() => {
            res.status(201).json(REPOSITORY_ADDED);
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        logger.error("Error executing in add repository in project webhook");
        logger.error(err);
        logger.info("=========================================");
        res.status(500).json(INTERNAL_SERVER_ERROR);
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      VALIDATION_ERROR.errors = err.errors;
      res.status(400).json(VALIDATION_ERROR);
    });
};
