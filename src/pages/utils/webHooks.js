const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const yup = require("yup");
const db = require("../../../models/sequelize");
const Users = db.users;
const UsersProjects = db.users_projects;
const Projects = db.projects;
const ProjectsRepositories = db.projects_repositories;

//update user information
module.exports.updateUser = async (res, data) => {
  yup
    .object()
    .shape({
      user_id: yup.string().required({ user_id: "required" }),
    })
    .validate(
      {
        user_id: data.user_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const user = await Users.findOne({
          where: { org_user_id: data.user_id },
        });
        if (!user) {
          res.status(404).json({
            message: "User Not Found For Specified Id",
          });
        } else {
          let updateObject = {};
          if (data.email) {
            updateObject.email = data.email;
          }
          if (data.name) {
            updateObject.name = data.name;
          }
          if (data.role) {
            updateObject.role = data.role;
          }
          if (data.github_handle) {
            updateObject.github_handle = data.github_handle;
          }
          if (data.gitlab_handle) {
            updateObject.gitlab_handle = data.gitlab_handle;
          }
          if (data.bitbucket_handle) {
            updateObject.bitbucket_handle = data.bitbucket_handle;
          }
          await Users.update(updateObject, {
            where: { org_user_id: data.user_id },
          });
          res.status(200).json({
            message: "user update successfully",
          });
        }
      } catch {
        res.status(500).json({
          message: "internal server error",
        });
      }
    })
    .catch(() => {
      res.status(400).json({
        message: "User id required",
      });
    });
};

//add user in project
module.exports.addUserInProject = async (res, data) => {
  yup
    .object()
    .shape({
      user_id: yup.string().required({ user_id: "required" }),
      project_id: yup.string().required({ project_id: "required" }),
    })
    .validate(
      {
        user_id: data.user_id,
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const projectAddUser = await Projects.findOne({
          where: { org_project_id: data.project_id },
        });
        if (!projectAddUser) {
          res.status(404).json({
            message: "project not found",
          });
        } else {
          const user = await Users.findOne({
            where: { org_user_id: data.user_id },
          });
          if (!user) {
            res.status(404).json({
              message: "user not found",
            });
          } else {
            const insertObj = {
              project_id: projectAddUser.id,
              user_id: user.id,
            };
            await UsersProjects.create(insertObj).then(() => {
              res.status(200).json({
                message: "added user in project successfully",
              });
            });
          }
        }
      } catch {
        res.status(500).json({
          message: "internal server error",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: { err },
      });
    });
};
//remove user from project
module.exports.removeUserFromProject = async (res, data) => {
  yup
    .object()
    .shape({
      user_id: yup.string().required({ user_id: "required" }),
      project_id: yup.string().required({ project_id: "required" }),
    })
    .validate(
      {
        user_id: data.user_id,
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const projectRemoveUser = await Projects.findOne({
          where: { org_project_id: data.project_id },
        });
        if (!projectRemoveUser) {
          res.status(404).json({
            message: "project not found",
          });
        } else {
          const user = await Users.findOne({
            where: { org_user_id: data.user_id },
          });
          if (!user) {
            res.status(404).json({
              message: "user not found",
            });
          } else {
            await UsersProjects.destroy({
              where: {
                project_id: projectRemoveUser.id,
                user_id: user.id,
              },
            }).then(() => {
              res.status(200).json({
                message: "removed user in project successfully",
              });
            });
          }
        }
      } catch {
        res.status(500).json({
          message: "internal server error",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: { err },
      });
    });
};

//change project status to active
module.exports.activeProject = async (res, data) => {
  yup
    .object()
    .shape({
      project_id: yup.string().required({ project_id: "required" }),
    })
    .validate(
      {
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const projectActive = await Projects.findOne({
          where: { org_project_id: data.project_id },
        });
        if (!projectActive) {
          res.status(404).json({
            message: "project not found",
          });
        } else {
          let projectData = { is_active: true };
          await Projects.update(projectData, {
            where: { org_project_id: data.project_id },
          }).then(() => {
            res.status(200).json({
              message: "project activated successfully",
            });
          });
        }
      } catch {
        res.status(500).json({
          message: "internal server error",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: { err },
      });
    });
};

//change project status to inactive
module.exports.inactiveProject = async (res, data) => {
  yup
    .object()
    .shape({
      project_id: yup.string().required({ project_id: "required" }),
    })
    .validate(
      {
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const projectInactive = await Projects.findOne({
          where: { org_project_id: data.project_id },
        });
        if (!projectInactive) {
          res.status(404).json({
            message: "project not found",
          });
        } else {
          let projectData = { is_active: false };
          await Projects.update(projectData, {
            where: { org_project_id: data.project_id },
          }).then(() => {
            res.status(200).json({
              message: "project Inactivated successfully",
            });
          });
        }
      } catch {
        res.status(500).json({
          message: "internal server error",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: { err },
      });
    });
};

//project deleted
module.exports.deleteProject = async (res, data) => {
  yup
    .object()
    .shape({
      project_id: yup.string().required({ project_id: "required" }),
    })
    .validate(
      {
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const projectDelete = await Projects.findOne({
          where: { org_project_id: data.project_id },
        });
        if (!projectDelete) {
          res.status(404).json({
            message: "project not found",
          });
        } else {
          await UsersProjects.destroy({
            where: {
              project_id: projectDelete.id,
            },
          });
          await ProjectsRepositories.destroy({
            where: {
              project_id: projectDelete.id,
            },
          });
          await Projects.destroy({
            where: { org_project_id: data.project_id },
          }).then(() => {
            res.status(200).json({
              message: "project deleted successfully",
            });
          });
        }
      } catch {
        res.status(500).json({
          message: "internal server error",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: { err },
      });
    });
};

//add project manager
module.exports.addManagerInProject = async (res, data) => {
  yup
    .object()
    .shape({
      user_id: yup.string().required({ user_id: "required" }),
      project_id: yup.string().required({ project_id: "required" }),
    })
    .validate(
      {
        user_id: data.user_id,
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const projectAddManager = await Projects.findOne({
          where: { org_project_id: data.project_id },
        });
        if (!projectAddManager) {
          res.status(404).json({
            message: "project not found",
          });
        } else {
          const user = await Users.findOne({
            where: { org_user_id: data.user_id },
          });
          if (!user) {
            res.status(404).json({
              message: "user not found",
            });
          } else {
            let projectData = { project_manager: user.id };
            await Projects.update(projectData, {
              where: { org_project_id: data.project_id },
            }).then(() => {
              res.status(200).json({
                message: "added project manager successfully",
              });
            });
          }
        }
      } catch {
        res.status(500).json({
          message: "internal server error",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: { err },
      });
    });
};

//remove project manager
module.exports.removeManagerFromProject = async (res, data) => {
  yup
    .object()
    .shape({
      user_id: yup.string().required({ user_id: "required" }),
      project_id: yup.string().required({ project_id: "required" }),
    })
    .validate(
      {
        user_id: data.user_id,
        project_id: data.project_id,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const projectRemoveManager = await Projects.findOne({
          where: { org_project_id: data.project_id },
        });
        if (!projectRemoveManager) {
          res.status(404).json({
            message: "project not found",
          });
        } else {
          const user = await Users.findOne({
            where: { org_user_id: data.user_id },
          });
          if (!user) {
            res.status(404).json({
              message: "user not found",
            });
          } else {
            let projectData = { project_manager: null };
            await Projects.update(projectData, {
              where: { org_project_id: data.project_id },
            }).then(() => {
              res.status(200).json({
                message: "remove project manager successfully",
              });
            });
          }
        }
      } catch {
        res.status(500).json({
          message: "internal server error",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: { err },
      });
    });
};

//Repository is Removed from Project
module.exports.removeRepositoryFromProject = async (res, data) => {
  yup
    .object()
    .shape({
      project_id: yup.string().required({ project_id: "required" }),
      repository_url: yup.string().required({ repository_url: "required" }),
    })
    .validate(
      {
        project_id: data.project_id,
        repository_url: data.repository_url,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const projectRemoveRepository = await Projects.findOne({
          where: { org_project_id: data.project_id },
        });
        if (!projectRemoveRepository) {
          res.status(404).json({
            message: "project not found",
          });
        } else {
          const repo = await ProjectsRepositories.findOne({
            where: { repository_url: data.repository_url },
          });
          if (!repo) {
            res.status(404).json({
              message: "repository not found",
            });
          } else {
            await ProjectsRepositories.destroy({
              where: {
                project_id: projectRemoveRepository.id,
                repository_url: data.repository_url,
              },
            }).then(() => {
              res.status(200).json({
                message: "repository removed successfully",
              });
            });
          }
        }
      } catch {
        res.status(500).json({
          message: "internal server error",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: { err },
      });
    });
};

//Repository is Added to Project
module.exports.addRepositoryInProject = async (res, data) => {
  yup
    .object()
    .shape({
      project_id: yup.string().required({ project_id: "required" }),
      repository_url: yup.string().required({ repository_url: "required" }),
    })
    .validate(
      {
        project_id: data.project_id,
        repository_url: data.repository_url,
      },
      { abortEarly: false }
    )
    .then(async () => {
      try {
        const projectAddRepository = await Projects.findOne({
          where: { org_project_id: data.project_id },
        });
        if (!projectAddRepository) {
          res.status(404).json({
            message: "project not found",
          });
        } else {
          const repoDetails = {
            repository_url: data.repository_url,
            host: data.Repository_details.host,
            project_id: projectAddRepository.id,
          };
          await ProjectsRepositories.create(repoDetails).then(() => {
            res.status(201).json({
              message: "repository added successfully",
            });
          });
        }
      } catch {
        res.status(500).json({
          message: "internal server error",
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: { err },
      });
    });
};
