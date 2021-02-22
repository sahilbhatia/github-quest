const request = require("superagent");
const dbConn = require("../models/sequelize");
const { headers } = require("../constants/intranetHeader");
const gitHeaders = require("../constants/githubHeader").headers;
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();
dbConn.sequelize;
const db = require("../models/sequelize");
const Users = db.users;
const Projects = db.projects;
const Projects_Repositories = db.projects_repositories;
const Repositories = db.repositories;
const Users_projects = db.users_projects;
//function for get project info by project repo url
const getInfoByProjectUrl = (url) => {
  let project = {};
  const splitArray = url.split("/");
  if (splitArray.length > 4) {
    let sourceType = splitArray[2].split(".")[0];
    if (
      sourceType.localeCompare("github") == 0 ||
      sourceType.localeCompare("bitbucket") == 0 ||
      sourceType.localeCompare("gitlab") == 0
    ) {
      project.sourceType = sourceType;
      project.handle = splitArray[3];
      project.repositorieName = splitArray[4];
      project.url = url;
      return project;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
// function for get project details from github
const getRepositoryFromGithub = async (project) => {
  try {
    let projectRepo = await request
      .get(
        `https://api.github.com/repos/${project.handle}/${project.repositorieName}`
      )
      .set(gitHeaders);
    if (projectRepo) {
      return projectRepo.body;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while fetching projects in get repositories from github function"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
// function for get project details from gitlab
const getRepositoryFromGitlab = async (project) => {
  try {
    let projectStatus = false;
    const gitlabUser = await request.get(
      `https://gitlab.com/api/v4/users?username=${project.handle}`
    );
    if (gitlabUser.body.length != 0) {
      const gitlabRepos = await request
        .get(
          `https://gitlab.com/api/v4/users/${gitlabUser.body[0].id}/projects`
        )
        .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
      gitlabRepos.body.forEach((repo) => {
        if (
          project.repositorieName.localeCompare(repo.name.toLowerCase()) == 0
        ) {
          projectStatus = repo;
        }
      });
      return projectStatus;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while fetching projects in get repositories from gitlab function"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
// function for get project details from bitbucket
const getRepositoryFromBitbucket = async (project) => {
  try {
    const projectRepo = await request.get(
      `https://api.bitbucket.org/2.0/repositories/${project.handle}/${project.repositorieName}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
    );
    if (projectRepo.body) {
      return projectRepo.body;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while fetching projects in get repositories from bitbucket function"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};

//funtion for create a repository database object as per project source  type
const getRepositoryObjBySourceType = (repo, sourceType) => {
  let customRepoObj = {
    source_type: sourceType,
    name: repo.name,
    description: repo.description,
    url: repo.html_url,
    source_repo_id: repo.id,
    is_personal: false,
    is_disabled: repo.disabled,
    is_archived: repo.archived,
    is_private: repo.private,
    is_forked: repo.fork,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    review: "pending",
  };
  if (sourceType == "gitlab") {
    customRepoObj.url = repo.web_url;
    customRepoObj.is_disabled = !repo.packages_enabled;
    customRepoObj.is_private = repo.visibility == "private" ? true : false;
    customRepoObj.is_forked = repo.forked_from_project ? true : false;
    customRepoObj.updated_at = repo.last_activity_at;
  } else if (sourceType == "bitbucket") {
    customRepoObj.url = repo.links.html.href;
    customRepoObj.source_repo_id = repo.uuid;
    customRepoObj.is_private = repo.is_private;
    customRepoObj.is_forked = repo.parent ? true : false;
    customRepoObj.created_at = repo.created_on;
    customRepoObj.updated_at = repo.updated_on;
    delete customRepoObj.is_disabled;
    delete customRepoObj.is_archived;
  }
  return customRepoObj;
};
//function for add entry in repositories table
const insertRepositoryInRepositories = async (repo, projectInfo) => {
  try {
    const customRepoObj = getRepositoryObjBySourceType(
      repo,
      projectInfo.sourceType
    );
    let insertRepos = await Repositories.create(customRepoObj);
    return insertRepos;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting bitbucket repositories in insert new repo function"
    );
    logger.error(err);
    logger.info("=========================================");
    return false;
  }
};
//function for insert repositories
const insertRepository = async (item, projectId) => {
  if (item.repositories.length > 0) {
    await item.repositories.map(async (item) => {
      try {
        if (item.url != null) {
          let projectInfo = getInfoByProjectUrl(item.url);
          let projectRepo = false;
          if (projectInfo) {
            if (projectInfo.sourceType == "github") {
              projectRepo = await getRepositoryFromGithub(projectInfo);
            } else if (projectInfo.sourceType == "gitlab") {
              projectRepo = await getRepositoryFromGitlab(projectInfo);
            } else if (projectInfo.sourceType == "bitbucket") {
              projectRepo = await getRepositoryFromBitbucket(projectInfo);
            }
          }
          if (projectRepo) {
            let insertRepos = await insertRepositoryInRepositories(
              projectRepo,
              projectInfo
            );
            if (insertRepos) {
              await Projects_Repositories.create({
                repository_id: insertRepos.dataValues.id,
                host: projectInfo.sourceType,
                project_id: projectId,
              });
              return insertRepos;
            } else {
              return false;
            }
          }
        }
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
      let project = await findProject(item.id);
      if (!project) {
        try {
          const insertProject = await addProject(item);
          if (insertProject) {
            project = insertProject;
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
      if (project) {
        item.repositories.map(async (ele) => {
          if (ele.url !== null) {
            let repoUrlInfo = getInfoByProjectUrl(ele.url);
            let projectRepo = false;
            if (repoUrlInfo) {
              if (repoUrlInfo.sourceType == "github") {
                projectRepo = await getRepositoryFromGithub(repoUrlInfo);
              } else if (repoUrlInfo.sourceType == "gitlab") {
                projectRepo = await getRepositoryFromGitlab(repoUrlInfo);
              } else if (repoUrlInfo.sourceType == "bitbucket") {
                projectRepo = await getRepositoryFromBitbucket(repoUrlInfo);
              }
              if (projectRepo) {
                //check suspicious repo
              }
            }
          }
        });
      }
    });
    await Promise.all(data);
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
