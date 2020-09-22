const request = require("superagent");
const moment = require("moment");
const dbConn = require("../models/sequelize");
dbConn.sequelize;
const db = require("../models/sequelize");
const Users = db.users;
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;

//function for insert new repository
const insertNewRepo = async (insertRepos, repo) => {
  insertRepos = await Repositories.create({
    source_type: "gitlab",
    source_repo_id: repo.id,
    name: repo.name,
    url: repo.web_url,
    description: repo.description,
    is_disabled: !repo.packages_enabled,
    is_archived: repo.archived,
    is_private: repo.visibility == "private" ? true : false,
    is_forked: repo.forked_from_project ? true : false,
    created_at: repo.created_at,
    updated_at: repo.last_activity_at,
    review: "pending",
  });
  return insertRepos;
};

//function for insert forked repo
const insertForkedRepoFunction = async (forkRepo, repo, insertRepos) => {
  const insertForkedRepo = await Repositories.create({
    source_type: "gitlab",
    source_repo_id: forkRepo.id,
    name: forkRepo.name,
    url: forkRepo.web_url,
    description: forkRepo.description,
    is_disabled: !forkRepo.packages_enabled,
    is_archived: forkRepo.archived,
    is_private: forkRepo.visibility == "private" ? true : false,
    is_forked: true,
    created_at: forkRepo.created_at,
    updated_at: forkRepo.last_activity_at,
    parent_repo_id: insertRepos
      ? insertRepos.dataValues.id
      : null,
    is_suspicious:
      (repo.visibility == "private" &&
        forkRepo.visibility != "private") ||
        (insertRepos
          ? insertRepos.dataValues.is_suspicious
          : false)
        ? true
        : false,
    review:
      (repo.visibility == "private" &&
        forkRepo.visibility != "private") ||
        (insertRepos
          ? insertRepos.dataValues.is_suspicious
          : false)
        ? "suspicious auto"
        : "no action",
    reviewed_at:
      (repo.visibility == "private" &&
        forkRepo.visibility != "private") ||
        (insertRepos
          ? insertRepos.dataValues.is_suspicious
          : false)
        ? moment.utc().format()
        : null,
  });
  return insertForkedRepo;
};

//function for link repository with user
const linkUserRepository = async (user, repo) => {
  await Users_repositories.create({
    user_id: user.id,
    repository_id: repo.id,
  });
  return null;
};

//function for find repo
const findRepoFunction = async (id) => {
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
};

//function for update repository
const updateRepo = async (insertParentRepo, insertRepos, ParentRepo, repo) => {
  await Repositories.update(
    {
      parent_repo_id: insertParentRepo.id,
      is_suspicious:
        ParentRepo.visibility == "private" &&
          repo.visibility != "private"
          ? true
          : false,
      review:
        ParentRepo.visibility == "private" &&
          repo.visibility != "private"
          ? "suspicious auto"
          : "no action",
      reviewed_at:
        ParentRepo.visibility == "private" &&
          repo.visibility != "private"
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
};

//function for update forked repo
const updateForkedRepo = async (insertRepos, forkRepo, repo) => {
  const updateObject = {
    is_forked: true,
    parent_repo_id: insertRepos.id,
    is_suspicious:
      (repo.visibility == "private" &&
        forkRepo.visibility != "private") ||
        insertRepos.is_suspicious
        ? true
        : false,
    review:
      (repo.visibility == "private" &&
        forkRepo.visibility != "private") ||
        insertRepos.is_suspicious
        ? "suspicious auto"
        : "no action",
    reviewed_at:
      (repo.visibility == "private" &&
        forkRepo.visibility != "private") ||
        insertRepos.is_suspicious
        ? moment.utc().format()
        : null,
    manual_review: false,
    updated_at: forkRepo.last_activity_at,
  };
  await Repositories.update(updateObject, {
    where: {
      source_repo_id: forkRepo.id.toString(),
    },
  });
  return null;
};

//insert gitlab repositories
module.exports.insertGitlabRepos = async (databaseUser) => {
  try {
    const gitlabUser = await request.get(
      `https://gitlab.com/api/v4/users?username=${databaseUser.dataValues.gitlab_handle}`
    );
    if (gitlabUser.body.length != 0) {
      const gitlabRepos = await request
        .get(
          `https://gitlab.com/api/v4/users/${gitlabUser.body[0].id}/projects`
        )
        .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
      const data = await gitlabRepos.body.map(async (repo) => {
        const findRepo = await findRepoFunction(repo.id);
        if (!findRepo) {
          let insertRepos;
          if (repo.visibility != "private") {
            insertRepos = await insertNewRepo(insertRepos, repo);
            await linkUserRepository(databaseUser.dataValues, insertRepos.dataValues);
          }
          //get parent repo
          if (repo.forked_from_project) {
            const ParentRepo = await request
              .get(
                `https://gitlab.com/api/v4/projects/${repo.forked_from_project.id}`
              )
              .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
            const findRepo = await findRepoFunction(ParentRepo.body.id);
            if (!findRepo) {
              let insertParentRepo;
              if (ParentRepo.body.visibility != "private") {
                insertRepos = await insertNewRepo(insertParentRepo, ParentRepo.body);
                if (gitlabUser.body[0].id == ParentRepo.creator_id) {
                  await linkUserRepository(databaseUser.dataValues, insertParentRepo.dataValues);
                }
              }
              if (repo.visibility != "private") {
                await updateRepo(insertParentRepo.dataValues, insertRepos.dataValues, ParentRepo.body, repo);
              }
            } else {
              if (repo.visibility != "private") {
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
          if (repo.forks_count != 0) {
            const forkedRepos = await request
              .get(`https://gitlab.com/api/v4/projects/${repo.id}/forks`)
              .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
            forkedRepos.body.map(async (forkRepo) => {
              const findRepo = await findRepoFunction(forkRepo.id);
              if (findRepo) {
                if (repo.visibility != "private") {
                  await updateForkedRepo(insertRepos.dataValues, forkRepo, repo);
                }
              } else {
                if (forkRepo.visibility != "private") {
                  const insertForkedRepo = await insertForkedRepoFunction(forkRepo, repo, insertRepos);

                  if (gitlabUser.body[0].id == forkRepo.creator_id) {
                    await linkUserRepository(databaseUser.dataValues, insertForkedRepo.dataValues);
                  }
                }
              }
            });
          }
        } else {
          //check repositories updated or not
          if (
            new Date(
              moment(databaseUser.dataValues.last_fetched_at)
                .add(330, "minutes")
                .toISOString()
            ).valueOf() < new Date(repo.last_activity_at).valueOf()
          ) {
            const updateRepo = {
              name: repo.name,
              url: repo.web_url,
              description: repo.description,
              is_disabled: !repo.packages_enabled,
              is_archived: repo.archived,
              is_private: repo.visibility == "private" ? true : false,
              updated_at: repo.last_activity_at,
            };
            await Repositories.update(updateRepo, {
              where: {
                source_repo_id: repo.id.toString(),
              },
            });
          }
          //get parent repo
          if (repo.forked_from_project) {
            const ParentRepo = await request
              .get(
                `https://gitlab.com/api/v4/projects/${repo.forked_from_project.id}`
              )
              .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
            const findParentRepo = await findRepoFunction(ParentRepo.body.id);
            if (!findParentRepo) {
              let insertParentRepo;
              if (ParentRepo.body.visibility != "private") {
                //insert repo
                insertParentRepo = await insertNewRepo(insertParentRepo, ParentRepo.body);
                if (gitlabUser.body[0].id == ParentRepo.creator_id) {
                  //link to the user
                  await linkUserRepository(databaseUser.dataValues, insertParentRepo.dataValues);
                }
              }
              if (repo.visibility != "private") {
                await updateRepo(insertParentRepo.dataValues, findRepo.dataValues, ParentRepo.body, repo);
              }
            } else {
              if (repo.visibility != "private") {
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
          if (repo.forks_count != 0) {
            const forkedRepos = await request
              .get(`https://gitlab.com/api/v4/projects/${repo.id}/forks`)
              .set({ "PRIVATE-TOKEN": process.env.GITLAB_ACCESS_TOKEN });
            forkedRepos.body.map(async (forkRepo) => {
              const findForkedRepo = await findRepoFunction(forkRepo.id);
              if (findForkedRepo) {
                await updateForkedRepo(findRepo.dataValues, forkRepo, repo);
                if (repo.visibility != "private") {
                }
              } else {
                if (forkRepo.visibility != "private") {
                  const insertForkedRepo = await insertForkedRepoFunction(forkRepo, repo, findRepo);
                  if (gitlabUser.body[0].id == forkRepo.creator_id) {
                    await linkUserRepository(databaseUser.dataValues, insertForkedRepo.dataValues);
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
          }).then(async (res) => {
            if (!res) {
              await Users_repositories.create({
                user_id: databaseUser.dataValues.id,
                repository_id: findRepo.dataValues.id,
              });
            }
          });
        }
      });
      await Promise.all(data);
      await Users.update(
        { last_fetched_at: moment.utc().format() },
        {
          returning: true,
          plain: true,
          where: { id: databaseUser.dataValues.id },
        }
      );
    } else {
      await Users.update(
        {
          error_details: "repositories not fetch for given gitlab handle",
        },
        {
          where: {
            id: databaseUser.dataValues.id,
          },
        }
      );
    }
    return;
  } catch {
    return;
  }
};
