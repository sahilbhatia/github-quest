const request = require("superagent");
const { headers } = require("../constants/githubHeader");
const moment = require("moment");
const dbConn = require("../models/sequelize");
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const githubServices = require("./../services/githubServices");
const logger = log4js.getLogger();
dbConn.sequelize;
const db = require("../models/sequelize");
const Users = db.users;
const Commits = db.commits;
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;

//function for get updated repositories
const getUpdatedRepositories = async (databaseUser) => {
  try {
    let usersRepos = await request
      .get(
        "https://api.github.com/users/" +
          databaseUser.dataValues.github_handle +
          "/repos?since=" +
          databaseUser.dataValues.last_fetched_at +
          ""
      )
      .set(headers);
    if (usersRepos) {
      return usersRepos;
    } else {
      return null;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in get updated repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

const getFileDirStructure = async (repoUrlInfo, branches, FileConstants) => {
  let filesListOfBranches = {};
  let data = await branches.map(async (branch) => {
    if (
      branch.name == "staging" ||
      branch.name == "production" ||
      branch.name == "master" ||
      branch.name == "main"
    ) {
      let url = `https://api.github.com/repos/${repoUrlInfo.handle}/${repoUrlInfo.repositorieName}/contents?ref=${branch.name}`;
      let fileList = await githubServices.getFileList(url);
      let filesListOfBranch = [];
      let projectTypes = [];
      let dirList = [];
      if (fileList) {
        fileList.forEach((file) => {
          if (file.type == "file") {
            let isFileFound = FileIsExistInConstantConfigList(
              file,
              FileConstants
            );
            if (isFileFound) {
              filesListOfBranch.push(file);
              projectTypes.concat(isFileFound.projectType);
            }
          } else {
            let isFileFound = FileIsExistInConstantConfigList(
              file,
              FileConstants
            );
            if (isFileFound) {
              dirList.push(file);
              projectTypes.concat(isFileFound.projectType);
            }
          }
        });
      }
      if (dirList.length > 0) {
        let list = await getFilesFromDirList(dirList, repoUrlInfo, branch.name);
        filesListOfBranch = filesListOfBranch.concat(list);
      }
      filesListOfBranches[branch.name] = filesListOfBranch;
    }
  });
  await Promise.all(data);
  return filesListOfBranches;
};
const FileIsExistInConstantConfigList = (file, FileConstants) => {
  try {
    let fileStatus = false;
    let projectType = [];
    FileConstants.forEach((ele) => {
      if (file.name.toLowerCase().includes(ele.dataValues.name)) {
        fileStatus = file;
        projectType.push(ele.dataValues.tech_type);
      }
    });
    if (fileStatus) {
      return {
        projectType: projectType,
      };
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while checking the file name is exist in data base"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};
//function for get file list from dirlist array
const getFilesFromDirList = async (dirList, repoUrlInfo, branchName) => {
  try {
    let fileList = [];
    let fileListByEachDir = [];
    if (dirList) {
      let data = await dirList.map(async (dir) => {
        let localDirList = [];
        let url = `https://api.github.com/repos/${repoUrlInfo.handle}/${repoUrlInfo.repositorieName}/contents/${dir.path}?ref=${branchName}`;
        fileListByEachDir = await githubServices.getFileList(url);
        if (fileListByEachDir) {
          fileListByEachDir.forEach((file) => {
            if (file.type == "file") {
              fileList.push(file);
            } else {
              localDirList.push(file);
            }
          });
          if (localDirList.length > 0) {
            let list = await getFilesFromDirList(
              localDirList,
              repoUrlInfo,
              branchName
            );
            if (list.length > 0) {
              fileList = fileList.concat(list);
            }
          }
        }
      });
      await Promise.all(data);
    }
    return fileList;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while getting the file list by some dir from github repo"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};
//function for get all repositories
const getAllRepositories = async (databaseUser) => {
  try {
    let usersRepos = await request
      .get(
        "https://api.github.com/users/" +
          databaseUser.dataValues.github_handle +
          "/repos"
      )
      .set(headers);
    if (usersRepos) {
      return usersRepos;
    } else {
      return null;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in get all repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    await Users.update(
      {
        error_details: "repositories not fetch for given github handle",
      },
      {
        where: {
          id: databaseUser.dataValues.id,
        },
      }
    );
    return null;
  }
};

//function for get user repositories
const getRepoForSpecificUser = async (databaseUser) => {
  let usersRepos;
  if (databaseUser.dataValues.last_fetched_at) {
    usersRepos = await getUpdatedRepositories(databaseUser);
  } else {
    usersRepos = await getAllRepositories(databaseUser);
  }
  return usersRepos;
};

//function for check the repo is existe or not if yes the update
const isRepositoryExist = async (repoInfo) => {
  let isExist = false;
  let result = await Repositories.update(repoInfo, {
    where: {
      source_repo_id: repoInfo.source_repo_id,
    },
  });
  result.map((item) => {
    if (item > 0) {
      isExist = true;
    }
  });
  if (isExist) {
    let updatedRepo = await Repositories.findOne({
      where: {
        source_repo_id: repoInfo.source_repo_id,
      },
    });
    return updatedRepo;
  } else {
    return isExist;
  }
};

//function for insert new repository
const insertNewRepo = async (item) => {
  try {
    let repoObj = {
      source_type: "github",
      source_repo_id: item.id.toString(),
      name: item.name,
      url: item.html_url,
      description: item.description,
      is_disabled: item.disabled,
      is_archived: item.archived,
      is_private: item.private,
      is_forked: item.fork,
      created_at: item.created_at,
      updated_at: item.updated_at,
      review: "pending",
    };
    let updatedRepo = await isRepositoryExist(repoObj);
    if (!updatedRepo) {
      let insertRepos = await Repositories.create(repoObj);
      return insertRepos;
    } else {
      return updatedRepo;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in insert new repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for link repository with user
const linkUserRepository = async (user, repo) => {
  try {
    await Users_repositories.create({
      user_id: user.id,
      repository_id: repo.id,
    });
    return null;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in link user repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for find repo
const findRepoFunction = async (id) => {
  try {
    const repo = await Repositories.findOne({
      where: {
        source_repo_id: id.toString(),
      },
    });
    if (!repo) {
      return false;
    } else {
      return repo;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories find repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for insert suspicious child repositories
const insertSuspiciousChildRepos = async (
  item,
  insertRepos,
  insertParentRepositories,
  databaseUser
) => {
  if (
    insertParentRepositories.dataValues.is_private ||
    insertParentRepositories.dataValues.is_suspicious
  ) {
    try {
      const childRepo = await request
        .get(
          `https://api.github.com/repos/${databaseUser.dataValues.github_handle}/${item.name}/forks`
        )
        .set(headers);
      await childRepo.body.map(async (value) => {
        try {
          await Repositories.create({
            source_type: "github",
            source_repo_id: value.id,
            name: value.name,
            url: value.html_url,
            description: value.description,
            is_disabled: value.disabled,
            is_archived: value.archived,
            is_private: value.private,
            created_at: value.created_at,
            updated_at: value.updated_at,
            parent_repo_id: insertRepos.dataValues.id,
            is_suspicious: true,
            reviewed_at: moment.utc().format(),
            review: "suspicious auto",
          });

          let userObject = await Users.findOne({
            where: { github_handle: value.owner.login },
          });
          if (userObject) {
            try {
              await Users_repositories.create({
                user_id: userObject.dataValues.id,
                repository_id: insertParentRepositories.dataValues.id,
              });
            } catch (err) {
              Sentry.captureException(err);
              logger.error(
                "Error executing while inserting github repositories in insert suspicious child repository function"
              );
              logger.error(err);
              logger.info("=========================================");
              await Users.update(
                {
                  error_details: "error comes while fetching repositories",
                },
                {
                  where: {
                    id: databaseUser.dataValues.id,
                  },
                }
              );
              return null;
            }
          }
          return null;
        } catch (err) {
          Sentry.captureException(err);
          logger.error(
            "Error executing while inserting github repositories in insert suspicious child repository function"
          );
          logger.error(err);
          logger.info("=========================================");
          await Users.update(
            {
              error_details: "error comes while inserting repositories",
            },
            {
              where: {
                id: databaseUser.dataValues.id,
              },
            }
          );
          return null;
        }
      });
      return null;
    } catch (err) {
      Sentry.captureException(err);
      logger.error(
        "Error executing while inserting github repositories in insert suspicious child repository function"
      );
      logger.error(err);
      logger.info("=========================================");
      await Users.update(
        {
          error_details: "error comes while fetching forks repositories",
        },
        {
          where: {
            id: databaseUser.dataValues.id,
          },
        }
      );
      return null;
    }
  } else {
    return null;
  }
};

//function for insert new repo if repo is forked repo
const insertForkedRepo = async (item, insertParentRepositories) => {
  try {
    const insertRepos = await Repositories.create({
      source_type: "github",
      source_repo_id: item.id,
      name: item.name,
      url: item.html_url,
      description: item.description,
      is_disabled: item.disabled,
      is_archived: item.archived,
      is_private: item.private,
      is_forked: item.fork,
      created_at: item.created_at,
      updated_at: item.updated_at,
      parent_repo_id: insertParentRepositories.dataValues.id,
      is_suspicious:
        insertParentRepositories.dataValues.is_private ||
        insertParentRepositories.dataValues.is_suspicious
          ? true
          : false,
      review:
        insertParentRepositories.dataValues.is_private ||
        insertParentRepositories.dataValues.is_suspicious
          ? "suspicious auto"
          : "no action",
      reviewed_at:
        insertParentRepositories.dataValues.is_private ||
        insertParentRepositories.dataValues.is_suspicious
          ? moment.utc().format()
          : null,
    });
    return insertRepos;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in insert forked repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for insert insert repositories when error in response
const insertErrorRepo = async (item, err) => {
  try {
    const insertRepos = await Repositories.create({
      source_type: "github",
      source_repo_id: item.id,
      name: item.name,
      url: item.html_url,
      description: item.description,
      is_disabled: item.disabled,
      is_archived: item.archived,
      is_private: item.private,
      is_forked: item.fork,
      created_at: item.created_at,
      updated_at: item.updated_at,
      error_details: err.response.text,
      parent_repo_id: null,
      is_suspicious: false,
      review: "pending",
    });
    return insertRepos;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in insert error function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for get parent repo data
const getParentRepoData = async (item, result, databaseUser, parentRepo) => {
  try {
    if (result[0].dataValues.parent_repo_id) {
      let findParent = await Repositories.findOne({
        where: { id: result[0].dataValues.parent_repo_id },
      });
      return findParent;
    } else {
      parentRepo = await request
        .get(
          `https://api.github.com/repos/${databaseUser.dataValues.github_handle}/${item.name}`
        )
        .set(headers);

      let findParent = await Repositories.findOne({
        where: {
          source_repo_id: parentRepo.body.parent.id.toString(),
        },
      });
      if (findParent) {
        return findParent;
      } else {
        let insertParent = await Repositories.create({
          source_type: "github",
          source_repo_id: parentRepo.body.parent.id,
          name: parentRepo.body.name,
          url: parentRepo.body.parent.html_url,
          description: parentRepo.body.parent.description,
          is_private: parentRepo.body.parent.private,
          is_archived: parentRepo.body.archived,
          is_disabled: parentRepo.body.disabled,
          is_forked: parentRepo.body.fork,
          created_at: parentRepo.body.parent.created_at,
          updated_at: parentRepo.body.parent.updated_at,
          review: "pending",
        });
        return insertParent;
      }
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in get parent repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for update repo
const updateRepo = async (result, item) => {
  try {
    await Repositories.update(
      {
        name: item.name,
        url: item.html_url,
        description: item.description,
        is_disabled: item.disabled,
        is_archived: item.archived,
        is_private: item.private,
        is_forked: item.fork,
        created_at: item.created_at,
        updated_at: item.updated_at,
      },
      {
        returning: true,
        where: {
          source_repo_id: result[0].dataValues.source_repo_id.toString(),
        },
      }
    );
    return null;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in update repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for update child repo
const updateChildRepo = async (item, result, insertParentRepositories) => {
  try {
    await Repositories.update(
      {
        name: item.name,
        url: item.html_url,
        description: item.description,
        is_disabled: item.disabled,
        is_archived: item.archived,
        is_private: item.private,
        is_forked: item.fork,
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_suspicious:
          insertParentRepositories.dataValues.is_private ||
          insertParentRepositories.dataValues.is_suspicious
            ? true
            : false,
        review:
          insertParentRepositories.dataValues.is_private ||
          insertParentRepositories.dataValues.is_suspicious
            ? "suspicious auto"
            : "no action",
        reviewed_at:
          insertParentRepositories.dataValues.is_private ||
          insertParentRepositories.dataValues.is_suspicious
            ? moment.utc().format()
            : null,
      },
      {
        returning: true,
        where: {
          source_repo_id: result[0].dataValues.source_repo_id.toString(),
        },
      }
    );
    return null;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in update child repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for update child repo
const updateForkedRepo = async (item, insertParentRepositories) => {
  try {
    await Repositories.update(
      {
        parent_repo_id: insertParentRepositories.dataValues.id,
        is_suspicious:
          insertParentRepositories.dataValues.is_private ||
          insertParentRepositories.dataValues.is_suspicious
            ? true
            : false,
        review:
          insertParentRepositories.dataValues.is_private ||
          insertParentRepositories.dataValues.is_suspicious
            ? "suspicious auto"
            : "no action",
        reviewed_at:
          insertParentRepositories.dataValues.is_private ||
          insertParentRepositories.dataValues.is_suspicious
            ? moment.utc().format()
            : null,
      },
      {
        returning: true,
        where: {
          source_repo_id: item.id.toString(),
        },
      }
    );
    return null;
  } catch (err) {
    Sentry.captureException(err);
    return null;
  }
};

//function for update repository error
const updateRepositoryError = async (id) => {
  try {
    await Repositories.update(
      {
        error_details: "error occur while updating repositories",
      },
      {
        where: {
          where: { id: id },
        },
      }
    );
    return null;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in update repository error function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for update repository error
const updateRepositoryErrorBySourceId = async (id) => {
  try {
    await Repositories.update(
      {
        error_details: "error occur while updating repositories",
      },
      {
        where: {
          where: {
            source_repo_id: id.toString(),
          },
        },
      }
    );
    return null;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in update repository error by source id function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for update user error
const updateUserError = async (id) => {
  try {
    await Users.update(
      {
        error_details: "error occur while inserting repositories ",
      },
      {
        where: {
          id: id,
        },
      }
    );
    return null;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in update user error function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for check updated repo
const isRepoUpdated = (item, repo) => {
  if (
    new Date(
      moment(repo.updated_at).add(330, "minutes").toISOString()
    ).valueOf() < new Date(item.updated_at).valueOf()
  ) {
    return true;
  } else {
    return false;
  }
};

//function for get new commit
const getCommits = async (repo, databaseUser) => {
  const commits = await request
    .get(
      `https://api.github.com/repos/${databaseUser.dataValues.github_handle}/${repo.name}/commits?since=${repo.updated_at}`
    )
    .set(headers);
  return commits.body;
};

//function for update review status
const updateReviewStatus = async (item, result, databaseUser) => {
  try {
    if (
      result[0].dataValues.review == "approved" ||
      result[0].dataValues.review == "suspicious manual"
    ) {
      if (isRepoUpdated(item, result[0].dataValues)) {
        const commits = await getCommits(result[0].dataValues, databaseUser);
        await commits.map(async (commit) => {
          const obj = {
            commit_id: commit.sha,
            commit: commit.commit.message,
            repository_id: result[0].dataValues.id,
          };
          await Commits.create(obj);
        });
        await Repositories.update(
          {
            updated_at: item.updated_at,
            review: "pending",
          },
          {
            where: {
              source_repo_id: result[0].dataValues.source_repo_id.toString(),
            },
          }
        );
      }
      return null;
    } else {
      return null;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting github repositories in update review status function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//insert repositories by github handle
const insertGithubRepos = async (databaseUser) => {
  const data = await getRepoForSpecificUser(databaseUser);
  if (data) {
    const mapData = await data.body.map(async (item) => {
      const result = await Repositories.findAll({
        where: { source_repo_id: item.id.toString() },
        order: [["id", "ASC"]],
      });
      if (result.length == 0) {
        //if repo is not forked
        if (item.fork === false) {
          try {
            const insertRepos = await insertNewRepo(item);
            await linkUserRepository(
              databaseUser.dataValues,
              insertRepos.dataValues
            );
          } catch (err) {
            Sentry.captureException(err);
            logger.error("Error executing while inserting github repositories");
            logger.error(err);
            logger.info("=========================================");
            await updateUserError(databaseUser.dataValues.id);
            return null;
          }
          //if repo is forked
        } else {
          try {
            let insertParentRepositories;
            const parentRepo = await request
              .get(
                `https://api.github.com/repos/${databaseUser.dataValues.github_handle}/${item.name}`
              )
              .set(headers);

            insertParentRepositories = await findRepoFunction(
              parentRepo.body.parent.id
            );
            //if parent repo existing
            if (insertParentRepositories) {
              try {
                let insertRepos;
                insertRepos = await findRepoFunction(item.id);
                if (insertRepos) {
                  await updateForkedRepo(item, insertParentRepositories);
                } else {
                  insertRepos = await insertForkedRepo(
                    item,
                    insertParentRepositories
                  );
                }
                await linkUserRepository(
                  databaseUser.dataValues,
                  insertRepos.dataValues
                );
                await insertSuspiciousChildRepos(
                  item,
                  insertRepos,
                  insertParentRepositories,
                  databaseUser
                );
                await Repositories.update(
                  {
                    review: "pending",
                  },
                  {
                    returning: true,
                    where: { id: insertParentRepositories.dataValues.id },
                  }
                );
              } catch (err) {
                Sentry.captureException(err);
                logger.error(
                  "Error executing while inserting github repositories"
                );
                logger.error(err);
                logger.info("=========================================");
                await updateRepositoryError(
                  insertParentRepositories.dataValues.id
                );
                return null;
              }
            } else {
              //insert parent repo
              try {
                insertParentRepositories = await insertNewRepo(
                  parentRepo.body.parent
                );
                let userObject = await Users.findOne({
                  where: {
                    github_handle: parentRepo.body.parent.owner.login,
                  },
                });

                if (userObject) {
                  try {
                    await linkUserRepository(
                      userObject.dataValues,
                      insertParentRepositories.dataValues
                    );
                  } catch (err) {
                    Sentry.captureException(err);
                    logger.error(
                      "Error executing while inserting github repositories"
                    );
                    logger.error(err);
                    logger.info("=========================================");
                    await updateUserError(databaseUser.dataValues.id);
                    return null;
                  }
                }
                let insertRepos;
                insertRepos = await findRepoFunction(item.id);
                if (insertRepos) {
                  await updateForkedRepo(item, insertParentRepositories);
                } else {
                  insertRepos = await insertForkedRepo(
                    item,
                    insertParentRepositories
                  );
                }
                await linkUserRepository(
                  databaseUser.dataValues,
                  insertRepos.dataValues
                );
                await insertSuspiciousChildRepos(
                  item,
                  insertRepos,
                  insertParentRepositories,
                  databaseUser
                );
              } catch (err) {
                Sentry.captureException(err);
                logger.error(
                  "Error executing while inserting github repositories"
                );
                logger.error(err);
                logger.info("=========================================");
                await updateRepositoryErrorBySourceId(
                  result[0].dataValues.source_repo_id
                );
                return null;
              }
            }
          } catch (err) {
            Sentry.captureException(err);
            logger.error("Error executing while inserting github repositories");
            logger.error(err);
            logger.info("=========================================");
            const insertRepos = await insertErrorRepo(item, err);
            await linkUserRepository(
              databaseUser.dataValues,
              insertRepos.dataValues
            );
          }
        }
      } else {
        await updateReviewStatus(item, result, databaseUser);
        if (item.fork == false) {
          try {
            await updateRepo(result, item);
          } catch (err) {
            logger.error("Error executing while inserting github repositories");
            logger.error(err);
            logger.info("=========================================");
            Sentry.captureException(err);
            await updateRepositoryErrorBySourceId(
              result[0].dataValues.source_repo_id
            );
            return null;
          }
        } else {
          try {
            let parentRepo;
            let insertParentRepositories = await getParentRepoData(
              item,
              result,
              databaseUser,
              parentRepo
            );

            await Repositories.findOne({
              where: { parent_repo_id: result[0].dataValues.id },
            });
            await updateChildRepo(item, result, insertParentRepositories);
          } catch (err) {
            Sentry.captureException(err);
            logger.error("Error executing while inserting github repositories");
            logger.error(err);
            logger.info("=========================================");
            await updateRepositoryErrorBySourceId(
              result[0].dataValues.source_repo_id
            );
            return null;
          }
        }
      }
    });
    try {
      await Promise.all(mapData);
    } catch (err) {
      Sentry.captureException(err);
      logger.error("Error executing while inserting github repositories");
      logger.error(err);
      logger.info("=========================================");
      await updateUserError(databaseUser.dataValues.id);
      return null;
    }
  }
  return null;
};

module.exports = {
  getFileDirStructure: getFileDirStructure,
  insertGithubRepos: insertGithubRepos,
};
