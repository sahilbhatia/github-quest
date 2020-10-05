const request = require("superagent");
const { headers } = require("../constants/githubHeader");
const moment = require("moment");
const dbConn = require("../models/sequelize");
const { Sentry } = require("./sentry");
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

//function for insert new repository
const insertNewRepo = async (item) => {
  try {
    const insertRepos = await Repositories.create({
      source_type: "github",
      source_repo_id: item.id,
      name: item.name,
      url: item.url,
      description: item.description,
      is_disabled: item.disabled,
      is_archived: item.archived,
      is_private: item.private,
      is_forked: item.fork,
      created_at: item.created_at,
      updated_at: item.updated_at,
      review: "pending",
    });
    return insertRepos;
  } catch (err) {
    Sentry.captureException(err);
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
            url: value.url,
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
      url: item.url,
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
      url: item.url,
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
          url: parentRepo.body.parent.url,
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
    return null;
  }
};

//function for update repo
const updateRepo = async (result, item) => {
  try {
    await Repositories.update(
      {
        name: item.name,
        url: item.url,
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
    return null;
  }
};

//function for update child repo
const updateChildRepo = async (item, result, insertParentRepositories) => {
  try {
    await Repositories.update(
      {
        name: item.name,
        url: item.url,
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
  try {
    const commits = await request
      .get(
        `https://api.github.com/repos/${databaseUser.dataValues.github_handle}/${repo.name}/commits?since=${repo.updated_at}`
      )
      .set(headers);
    return commits.body;
  } catch (err) {
    Sentry.captureException(err);
    return null;
  }
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
    return null;
  }
};

//insert repositories by github handle
module.exports.insertGithubRepos = async (databaseUser) => {
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
                const insertRepos = await insertForkedRepo(
                  item,
                  insertParentRepositories
                );
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
                await updateRepositoryError(
                  insertParentRepositories.dataValues.id
                );
                return null;
              }
            } else {
              //insert parent repo
              try {
                insertParentRepositories = await insertNewRepo(parentRepo.body);
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
                    await updateUserError(databaseUser.dataValues.id);
                    return null;
                  }
                }
                const insertRepos = await insertForkedRepo(
                  item,
                  insertParentRepositories
                );
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
                await updateRepositoryErrorBySourceId(
                  result[0].dataValues.source_repo_id
                );
                return null;
              }
            }
          } catch (err) {
            Sentry.captureException(err);
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
      await updateUserError(databaseUser.dataValues.id);
      return null;
    }
  }
  return null;
};
