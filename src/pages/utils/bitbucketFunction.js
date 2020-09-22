const request = require("superagent");
const moment = require("moment");
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;

//function for insert new repository
const insertNewRepo = async (insertRepos, repo) => {
  insertRepos = await Repositories.create({
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
  });
  return insertRepos;
};

//function for insert forked repo
const insertForkedRepoFunction = async (forkRepo, repo, insertRepos) => {
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
};

//function for update forked repo
const updateForkedRepo = async (insertRepos, forkRepo, repo) => {
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
};

//function for check valid bitbucket handle
const getBitBucketRepos = async (databaseUser) => {
  try {
    const bitbucketRepos = await request.get(
      `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
    );
    return bitbucketRepos;
  } catch {
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
    await Users.update(
      { last_fetched_at: moment.utc().format() },
      {
        returning: true,
        plain: true,
        where: { id: databaseUser.dataValues.id },
      }
    );
    return;
  } catch {
    return;
  }
};
