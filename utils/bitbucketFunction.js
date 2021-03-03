const request = require("superagent");
const moment = require("moment");
const dbConn = require("../models/sequelize");
const { Sentry } = require("./sentry");
const log4js = require("../config/loggerConfig");
const logger = log4js.getLogger();
dbConn.sequelize;
const db = require("../models/sequelize");
const Users = db.users;
const Commits = db.commits;
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;

//function for check the repo is existe or not if yes the update
const isRepositoryExist = async (repoInfo) => {
  let isExist = false;
  let result = await Repositories.update(repoInfo, {
    where: {
      source_repo_id: repoInfo.id,
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
        source_repo_id: repoInfo.id,
      },
    });
    return updatedRepo;
  } else {
    return isExist;
  }
};
//function for insert new repository
const insertNewRepo = async (insertRepos, repo) => {
  try {
    let repoObj = {
      source_type: "bitbucket",
      source_repo_id: repo.uuid,
      name: repo.name,
      url: repo.links.html.href,
      description: repo.description,
      is_private: repo.is_private,
      is_forked: repo.parent ? true : false,
      created_at: repo.created_on,
      updated_at: repo.updated_on,
      review: "pending",
    };
    let updatedRepo = await isRepositoryExist(repoObj);
    if (!updatedRepo) {
      insertRepos = await Repositories.create(repoObj);
      return insertRepos;
    } else {
      return updatedRepo;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting bitbucket repositories in insert new repo function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for insert forked repo
const insertForkedRepoFunction = async (forkRepo, repo, insertRepos) => {
  try {
    const insertForkedRepo = await Repositories.create({
      source_type: "bitbucket",
      source_repo_id: forkRepo.uuid,
      name: forkRepo.name,
      url: forkRepo.web_url,
      description: forkRepo.description,
      is_disabled: !forkRepo.packages_enabled,
      is_archived: forkRepo.archived,
      is_private: forkRepo.is_private ? true : false,
      is_forked: true,
      created_at: forkRepo.created_at,
      updated_at: forkRepo.last_activity_at,
      parent_repo_id: insertRepos ? insertRepos.dataValues.id : null,
      is_suspicious:
        (repo.is_private && !forkRepo.is_private) ||
        (insertRepos ? insertRepos.dataValues.is_suspicious : false)
          ? true
          : false,
      review:
        (repo.is_private && !forkRepo.is_private) ||
        (insertRepos ? insertRepos.dataValues.is_suspicious : false)
          ? "suspicious auto"
          : "no action",
      reviewed_at:
        (repo.is_private && !forkRepo.is_private) ||
        (insertRepos ? insertRepos.dataValues.is_suspicious : false)
          ? moment.utc().format()
          : null,
    });
    return insertForkedRepo;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting bitbucket repositories in insert forked repo function"
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
      "Error executing while inserting bitbucket repositories in link user repo function"
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
      "Error executing while inserting bitbucket repositories in find repo function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for update repository
const updateRepo = async (insertParentRepo, insertRepos, ParentRepo, repo) => {
  try {
    await Repositories.update(
      {
        parent_repo_id: insertParentRepo.id,
        is_suspicious: ParentRepo.is_private && !repo.is_private ? true : false,
        review:
          ParentRepo.is_private && !repo.is_private
            ? "suspicious auto"
            : "no action",
        reviewed_at:
          ParentRepo.is_private && !repo.is_private
            ? moment.utc().format()
            : null,
        manual_review: false,
      },
      {
        where: {
          id: insertRepos.id,
        },
      }
    );
    return null;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting bitbucket repositories in update repo function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for update forked repo
const updateForkedRepo = async (insertRepos, forkRepo, repo) => {
  try {
    const updateObject = {
      is_forked: true,
      parent_repo_id: insertRepos.id,
      is_suspicious:
        (repo.is_private && !forkRepo.is_private) || insertRepos.is_suspicious
          ? true
          : false,
      review:
        (repo.is_private && !forkRepo.is_private) || insertRepos.is_suspicious
          ? "suspicious auto"
          : "no action",
      reviewed_at:
        (repo.is_private && !forkRepo.is_private) || insertRepos.is_suspicious
          ? moment.utc().format()
          : null,
      manual_review: false,
    };
    await Repositories.update(updateObject, {
      where: {
        source_repo_id: forkRepo.uuid,
      },
    });
    return null;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting bitbucket repositories in update forked repo function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//function for check valid bitbucket handle
const getBitBucketRepos = async (databaseUser) => {
  try {
    const bitbucketRepos = await request.get(
      `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
    );
    return bitbucketRepos;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting bitbucket repositories in get bitbucket repo function"
    );
    logger.error(err);
    logger.info("=========================================");
    await Users.update(
      {
        error_details: "repositories not fetch for given bitbucket handle",
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

//function for check updated repo
const isRepoUpdated = (item, repo) => {
  if (
    new Date(
      moment(repo.reviewed_at).add(330, "minutes").toISOString()
    ).valueOf() < new Date(item.updated_on).valueOf()
  ) {
    return true;
  } else {
    return false;
  }
};

//function for get all branches of single repository
const getAllBranchesOfRepo = async (repoInfo) => {
  try {
    let isIncompleteCommits = true;
    let count = 10;
    let allBranches = [];
    let url = `https://api.bitbucket.org/2.0/repositories/${repoInfo.handle}/${repoInfo.repositorieName}/refs/branches?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}&pagelen=10`;
    while (isIncompleteCommits) {
      let ProjectBranches = await request.get(url);
      if (ProjectBranches.body) {
        allBranches = allBranches.concat(ProjectBranches.body.values);
        if (count < ProjectBranches.body.size) {
          url = ProjectBranches.body.next;
          count = count + 10;
        } else {
          break;
        }
      }
    }
    if (allBranches.length > 0) {
      return allBranches;
    } else {
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while get all branches of  bitbucket repository in get all branches of repository function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};
//function for get all commits of all branches
const getCommitsByBranches = async (repo, repoUrlInfo, branches) => {
  let commitsObj = {};
  let data = await branches.map(async (branch) => {
    //can we just hit this API for master ,staging and production branches
    try {
      let isIncompleteCommits = true;
      let allCommits = [];
      let url = `https://api.bitbucket.org/2.0/repositories/${repoUrlInfo.handle}/${repoUrlInfo.repositorieName}/commits/${branch.name}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`;
      try {
        while (isIncompleteCommits) {
          const commits = await request.get(url);
          if (repo.reviewed_at && commits.body.values.length > 0) {
            if (
              new Date(commits.body.values[0].date) > new Date(repo.reviewed_at)
            ) {
              if (
                new Date(
                  commits.body.values[commits.body.values.length - 1].date
                ) > new Date(repo.reviewed_at)
              ) {
                allCommits = allCommits.concat(commits.body.values);
                url = commits.body.next;
              } else {
                commits.body.values.map((commit) => {
                  if (new Date(commit.date) >= new Date(repo.reviewed_at)) {
                    allCommits.push(commit);
                  }
                });
                url = commits.body.next;
              }
              if (!url) {
                isIncompleteCommits = false;
              }
            } else {
              isIncompleteCommits = false;
            }
          } else {
            isIncompleteCommits = false;
          }
        }
      } catch (err) {
        logger.error(err);
        logger.info("=========================================");
      }
      commitsObj[branch.name] = allCommits;
    } catch (err) {
      Sentry.captureException(err);
      logger.error(
        "Error executing while get all branches of  bitbucket repository in get all branches of repository function"
      );
      logger.error(err);
      logger.info("=========================================");
      commitsObj[branch.name] = false;
    }
  });
  await Promise.all(data);
  return commitsObj;
};
//function for get new commit
const getCommits = async (repo, databaseUser) => {
  const commits = await request.get(
    `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}/${repo.name}/commits?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
  );
  let array = [];
  await commits.body.values.map((commit) => {
    if (
      new Date(
        moment(repo.reviewed_at).add(330, "minutes").toISOString()
      ).valueOf() < new Date(commit.date).valueOf()
    ) {
      array.push(commit);
    }
  });
  return array;
};

//function for update review status
const updateReviewStatus = async (item, findRepo, databaseUser) => {
  try {
    if (
      findRepo.dataValues.review == "approved" ||
      findRepo.dataValues.review == "suspicious manual"
    ) {
      if (isRepoUpdated(item, findRepo.dataValues)) {
        const commits = await getCommits(findRepo.dataValues, databaseUser);
        if (commits.length != 0) {
          await commits.map(async (commit) => {
            const obj = {
              commit_id: commit.hash,
              commit: commit.message,
              repository_id: findRepo.dataValues.id,
            };
            await Commits.create(obj);
          });
          await Repositories.update(
            {
              updated_at: item.updated_on,
              review: "pending",
            },
            {
              where: {
                source_repo_id: findRepo.dataValues.source_repo_id.toString(),
              },
            }
          );
        }
      }
      return null;
    } else {
      return null;
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      "Error executing while inserting bitbucket repositories in update review status function"
    );
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

//insert bitbucket repositories
module.exports.insertBitbucketRepos = async (databaseUser) => {
  try {
    let bitbucketRepos = await getBitBucketRepos(databaseUser);
    const data = await bitbucketRepos.body.values.map(async (repo) => {
      const findRepo = await findRepoFunction(repo.uuid);
      if (!findRepo) {
        let insertRepos;
        if (!repo.is_private) {
          insertRepos = await insertNewRepo(insertRepos, repo);
          await linkUserRepository(
            databaseUser.dataValues,
            insertRepos.dataValues
          );
        }
        //get parent repo
        if (repo.parent) {
          const ParentRepo = await request.get(
            `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}/${repo.parent.name}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
          );
          const findRepo = await findRepoFunction(ParentRepo.body.uuid);
          if (!findRepo) {
            let insertParentRepo;
            if (!ParentRepo.body.is_private) {
              insertRepos = await insertNewRepo(
                insertParentRepo,
                ParentRepo.body
              );
              if (
                bitbucketRepos.body.values[0].owner.uuid ==
                ParentRepo.body.owner.uuid
              ) {
                await linkUserRepository(
                  databaseUser.dataValues,
                  insertParentRepo.dataValues
                );
              }
            }
            if (!repo.is_private) {
              await updateRepo(
                insertParentRepo.dataValues,
                insertRepos.dataValues,
                ParentRepo.body,
                repo
              );
            }
          } else {
            if (!repo.is_private) {
              await Repositories.update(
                {
                  parent_repo_id: findRepo.dataValues.id,
                },
                {
                  where: {
                    id: insertRepos.dataValues.id,
                  },
                }
              );
            }
          }
        }
        //get forked repositories
        const forkedRepos = await request.get(
          `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}/${repo.name}/forks?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
        );
        if (forkedRepos.body.size != 0) {
          forkedRepos.body.values.map(async (forkRepo) => {
            const findRepo = await findRepoFunction(forkRepo.uuid);
            if (findRepo) {
              if (!repo.is_private) {
                await updateForkedRepo(insertRepos.dataValues, forkRepo, repo);
              }
            } else {
              let insertForkedRepo;
              if (!forkRepo.is_private) {
                insertForkedRepo = await insertForkedRepoFunction(
                  forkRepo,
                  repo,
                  insertRepos
                );
                if (
                  bitbucketRepos.body.values[0].owner.uuid ==
                  forkRepo.owner.uuid
                ) {
                  await linkUserRepository(
                    databaseUser.dataValues,
                    insertForkedRepo.dataValues
                  );
                }
              }
            }
          });
        }
      } else {
        await updateReviewStatus(repo, findRepo, databaseUser);
        //get parent repo
        if (repo.parent) {
          const ParentRepo = await request.get(
            `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}/${repo.parent.name}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
          );
          const findParentRepo = await findRepoFunction(ParentRepo.body.uuid);
          if (!findParentRepo) {
            let insertParentRepo;
            if (!ParentRepo.body.is_private) {
              insertParentRepo = await insertNewRepo(
                insertParentRepo,
                ParentRepo.body
              );
              if (
                bitbucketRepos.body.values[0].owner.uuid ==
                ParentRepo.body.owner.uuid
              ) {
                await linkUserRepository(
                  databaseUser.dataValues,
                  insertParentRepo.dataValues
                );
              }
            }
            if (!repo.is_private) {
              await updateRepo(
                insertParentRepo.dataValues,
                findRepo.dataValues,
                ParentRepo.body,
                repo
              );
            }
          } else {
            if (!repo.is_private) {
              await Repositories.update(
                {
                  parent_repo_id: findParentRepo.dataValues.id,
                },
                {
                  where: {
                    id: findRepo.dataValues.id,
                  },
                }
              );
            }
          }
        }
        //get forked repositories
        const forkedRepos = await request.get(
          `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}/${repo.name}/forks?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
        );
        if (forkedRepos.body.size != 0) {
          forkedRepos.body.values.map(async (forkRepo) => {
            const findChildRepo = await findRepoFunction(forkRepo.uuid);
            if (findChildRepo) {
              if (!repo.is_private) {
                await updateForkedRepo(findRepo.dataValues, forkRepo, repo);
              }
            } else {
              let insertForkedRepo;
              if (!forkRepo.is_private) {
                insertForkedRepo = await insertForkedRepoFunction(
                  forkRepo,
                  repo,
                  findRepo
                );
                if (
                  bitbucketRepos.body.values[0].owner.uuid ==
                  forkRepo.owner.uuid
                ) {
                  await linkUserRepository(
                    databaseUser.dataValues,
                    insertForkedRepo.dataValues
                  );
                }
              }
            }
          });
        }
        await Users_repositories.findOne({
          where: {
            user_id: databaseUser.dataValues.id,
            repository_id: findRepo.dataValues.id,
          },
        }).then((res) => {
          if (!res) {
            Users_repositories.create({
              user_id: databaseUser.dataValues.id,
              repository_id: findRepo.dataValues.id,
            });
          }
        });
      }
    });
    await Promise.all(data);
    return null;
  } catch (err) {
    Sentry.captureException(err);
    logger.error("Error executing while inserting bitbucket repositories");
    logger.error(err);
    logger.info("=========================================");
    return null;
  }
};

module.exports = {
  getAllBranchesOfRepo: getAllBranchesOfRepo,
  getCommits: getCommits,
  getCommitsByBranches: getCommitsByBranches,
};
