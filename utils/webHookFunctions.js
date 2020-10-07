const dbConn = require("../models/sequelize");
dbConn.sequelize;
const db = require("../models/sequelize");
const { Sentry } = require("./sentry");
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

//find user
const findUser = async (id, res) => {
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
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//find manager
const findManager = async (userId, projectId, res) => {
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
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//find project
const findProject = async (id, res) => {
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
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//find repository
const findRepository = async (url, res) => {
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
    res.status(500).json({
      message: "Internal Server Error",
    });
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
        const user = await findUser(data.user_id, res);
        if (!user) {
          res.status(404).json({
            message: "User Not Found For Specified Id",
          });
        } else {
          let updateObject = getUpdateObj(data);
          await Users.update(updateObject, {
            where: { org_user_id: data.user_id },
          });
          res.status(200).json({
            message: "User Updated Successfully",
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
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
        const project = await findProject(data.project_id, res);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found For Specified Id",
          });
        } else {
          const user = await findUser(data.user_id, res);
          if (!user) {
            res.status(404).json({
              message: "User Not Found For Specified Id",
            });
          } else {
            const insertObj = {
              project_id: project.id,
              user_id: user.id,
            };
            await UsersProjects.create(insertObj);
            res.status(200).json({
              message: "Added User In Project Successfully",
            });
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
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
        const project = await findProject(data.project_id, res);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found For Specified Id",
          });
        } else {
          const user = await findUser(data.user_id, res);
          if (!user) {
            res.status(404).json({
              message: "User Not Found For Specified Id",
            });
          } else {
            await UsersProjects.destroy({
              where: {
                project_id: project.id,
                user_id: user.id,
              },
            });
            res.status(200).json({
              message: "Removed User From Project Successfully",
            });
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
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
        const project = await findProject(data.project_id, res);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found For Specified Id",
          });
        } else {
          let projectData = { is_active: is_active };
          await Projects.update(projectData, {
            where: { org_project_id: data.project_id },
          });
          if (is_active) {
            res.status(200).json({
              message: "Project Activated Successfully",
            });
          } else {
            res.status(200).json({
              message: "Project Inactivated Successfully",
            });
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
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
        const project = await findProject(data.project_id, res);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found For Specified Id",
          });
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
          res.status(200).json({
            message: "Project Deleted Successfully",
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
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
        const project = await findProject(data.project_id, res);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found For Specified Id",
          });
        } else {
          const user = await findUser(data.user_id, res);
          if (!user) {
            res.status(404).json({
              message: "User Not Found For Specified Id",
            });
          } else {
            let projectData = { project_manager: user.id };
            await Projects.update(projectData, {
              where: { org_project_id: data.project_id },
            });
            res.status(200).json({
              message: "Added Project Manager Successfully",
            });
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
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
        const project = await findProject(data.project_id, res);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found For Specified Id",
          });
        } else {
          const user = await findUser(data.user_id, res);
          if (!user) {
            res.status(404).json({
              message: "User Not Found For Specified Id",
            });
          } else {
            const manager = await findManager(user.id, data.project_id, res);
            if (!manager) {
              res.status(404).json({
                message: "Manager Not Assigned To Specified Project Id",
              });
            } else {
              let projectData = { project_manager: null };
              await Projects.update(projectData, {
                where: { org_project_id: data.project_id },
              });
              res.status(200).json({
                message: "Remove Project Manager Successfully",
              });
            }
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
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
        const project = await findProject(data.project_id, res);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found For Specified Id",
          });
        } else {
          const repo = await findRepository(data.repository_url, res);
          if (!repo) {
            res.status(404).json({
              message: "Repository Not Found For Specified Url",
            });
          } else {
            await ProjectsRepositories.destroy({
              where: {
                project_id: project.id,
                repository_url: data.repository_url,
              },
            }).then(() => {
              res.status(200).json({
                message: "Repository Removed Successfully",
              });
            });
          }
        }
      } catch (err) {
        Sentry.captureException(err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
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
        const project = await findProject(data.project_id, res);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found For Specified Id",
          });
        } else {
          const repoDetails = {
            repository_url: data.repository_url,
            host: data.repository_details.host,
            project_id: project.id,
          };
          await ProjectsRepositories.create(repoDetails).then(() => {
            res.status(201).json({
              message: "Repository Added Successfully",
            });
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      Sentry.captureException(err);
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};
