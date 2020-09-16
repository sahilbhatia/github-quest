const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const UsersProjects = db.users_projects;
const Projects = db.projects;
const ProjectsRepositories = db.projects_repositories;
const validation = require("./validationSchema");
const userSchema = validation.userIdSchema();
const projectSchema = validation.projectIdSchema();
const userProjectSchema = validation.userProjectSchema();
const repositoryProjectSchema = validation.repositoryProjectSchema();

//find user
const findUser = async (id) => {
  const user = await Users.findOne({
    where: { org_user_id: id },
  });
  if (!user) {
    return false;
  } else {
    return user;
  }
};

//find manager
const findManager = async (userId, projectId) => {
  const manager = await Projects.findOne({
    where: { org_project_id: projectId, project_manager: userId },
  });
  if (!manager) {
    return false;
  } else {
    return true;
  }
};

//find project
const findProject = async (id) => {
  const project = await Projects.findOne({
    where: { org_project_id: id },
  });
  if (!project) {
    return false;
  } else {
    return project;
  }
};

//find repository
const findRepository = async (url) => {
  const repo = await ProjectsRepositories.findOne({
    where: { repository_url: url },
  });
  if (!repo) {
    return false;
  } else {
    return repo;
  }
};

//update user information
module.exports.updateUser = async (res, data) => {
  userSchema
    .validate({
      user_id: data.user_id,
    })
    .then(async () => {
      try {
        const user = findUser(data.user_id);
        if (!user) {
          res.status(404).json({
            message: "User Not Found For Specified Id",
          });
        } else {
          let updateObject = {
            email: data.email,
            name: data.name,
            role: data.role,
            github_handle: data.github_handle,
            gitlab_handle: data.gitlab_handle,
            bitbucket_handle: data.bitbucket_handle,
          };
          await Users.update(updateObject, {
            where: { org_user_id: data.user_id },
          });
          res.status(200).json({
            message: "User Updated Successfully",
          });
        }
      } catch {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};

//add user in project
module.exports.addUserInProject = async (res, data) => {
  userProjectSchema
    .validate(
      {
        user_id: data.user_id,
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const project = findProject(data.project_id);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found",
          });
        } else {
          const user = findUser(data.user_id);
          if (!user) {
            res.status(404).json({
              message: "User Not Found",
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
      } catch {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};

//remove user from project
module.exports.removeUserFromProject = async (res, data) => {
  userProjectSchema
    .validate(
      {
        user_id: data.user_id,
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const project = findProject(data.project_id);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found",
          });
        } else {
          const user = findUser(data.user_id);
          if (!user) {
            res.status(404).json({
              message: "User Not Found",
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
      } catch {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};

//change project status
module.exports.changeStatusOfProject = async (res, data, is_active) => {
  projectSchema
    .validate({
      project_id: data.project_id,
    })
    .then(async () => {
      try {
        const project = findProject(data.project_id);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found",
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
      } catch {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};

//project deleted
module.exports.deleteProject = async (res, data) => {
  projectSchema
    .validate({
      project_id: data.project_id,
    })
    .then(async () => {
      try {
        const project = findProject(data.project_id);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found",
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
      } catch {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};

//add project manager
module.exports.addManagerInProject = async (res, data) => {
  userProjectSchema
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
          res.status(404).json({
            message: "Project Not Found",
          });
        } else {
          const user = findUser(data.user_id);
          if (!user) {
            res.status(404).json({
              message: "User Not Found",
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
      } catch {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};

//remove project manager
module.exports.removeManagerFromProject = async (res, data) => {
  userProjectSchema
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
          res.status(404).json({
            message: "Project Not Found",
          });
        } else {
          const user = findUser(data.user_id);
          if (!user) {
            res.status(404).json({
              message: "User Not Found",
            });
          } else {
            const manager = findManager(data.user_id);
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
      } catch {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};

//Repository is Removed from Project
module.exports.removeRepositoryFromProject = async (res, data) => {
  repositoryProjectSchema
    .validate(
      {
        project_id: data.project_id,
        repository_url: data.repository_url,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const project = findProject(data.project_id);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found",
          });
        } else {
          const repo = await findRepository(data.repository_url);
          if (!repo) {
            res.status(404).json({
              message: "Repository Not Found",
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
      } catch {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};

//Repository is Added to Project
module.exports.addRepositoryInProject = async (res, data) => {
  repositoryProjectSchema
    .validate(
      {
        project_id: data.project_id,
        repository_url: data.repository_url,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const project = findProject(data.project_id);
        if (!project) {
          res.status(404).json({
            message: "Project Not Found",
          });
        } else {
          const repoDetails = {
            repository_url: data.repository_url,
            host: data.Repository_details.host,
            project_id: project.id,
          };
          await ProjectsRepositories.create(repoDetails).then(() => {
            res.status(201).json({
              message: "Repository Added Successfully",
            });
          });
        }
      } catch {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    })
    .catch((err) => {
      const errors = err.errors;
      res.status(400).json({
        message: "Validation Error",
        errors,
      });
    });
};
