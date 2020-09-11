const request = require("superagent");
const moment = require("moment");
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;

module.exports.insertBitbucketRepos = async (databaseUser) => {
  try {
    let bitbucketRepos;
    try {
      bitbucketRepos = await request.get(
        `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
      );
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
      return;
    }
    const data = await bitbucketRepos.body.values.map(async (repo) => {
      const findRepo = await Repositories.findOne({
        where: {
          source_repo_id: repo.uuid,
        },
      });
      if (!findRepo) {
        let insertRepos;
        if (!repo.is_private) {
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
          await Users_repositories.create({
            user_id: databaseUser.dataValues.id,
            repository_id: insertRepos.dataValues.id,
          });
        }
        if (repo.parent) {
          const ParentRepo = await request.get(
            `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}/${repo.parent.name}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
          );
          const findRepo = await Repositories.findOne({
            where: {
              source_repo_id: ParentRepo.body.uuid,
            },
          });
          if (!findRepo) {
            let insertParentRepo;
            if (!ParentRepo.body.is_private) {
              insertParentRepo = await Repositories.create({
                source_type: "gitlab",
                source_repo_id: ParentRepo.body.uuid,
                name: ParentRepo.body.name,
                url: ParentRepo.body.links.html.href,
                description: ParentRepo.body.description,
                is_private: ParentRepo.body.is_private,
                is_forked: ParentRepo.body.parent ? true : false,
                created_at: ParentRepo.body.created_on,
                updated_at: ParentRepo.body.updated_on,
                review: "pending",
              });
              if (
                bitbucketRepos.body.values[0].owner.uuid ==
                ParentRepo.body.owner.uuid
              ) {
                await Users_repositories.create({
                  user_id: databaseUser.dataValues.id,
                  repository_id: insertParentRepo.dataValues.id,
                });
              }
            }
            if (!repo.is_private) {
              await Repositories.update(
                {
                  parent_repo_id: insertParentRepo.dataValues.id,
                  is_suspicious:
                    ParentRepo.body.is_private && !repo.is_private
                      ? true
                      : false,
                  review:
                    ParentRepo.body.is_private && !repo.is_private
                      ? "suspicious auto"
                      : "no action",
                  reviewed_at:
                    ParentRepo.body.is_private && !repo.is_private
                      ? moment.utc().format()
                      : null,
                  manual_review: false,
                },
                {
                  where: {
                    id: insertRepos.dataValues.id,
                  },
                }
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
        const forkedRepos = await request.get(
          `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}/${repo.name}/forks?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
        );
        if (forkedRepos.body.size != 0) {
          forkedRepos.body.values.map(async (forkRepo) => {
            const findRepo = await Repositories.findOne({
              where: {
                source_repo_id: forkRepo.uuid,
              },
            });
            if (findRepo) {
              if (!repo.is_private) {
                const updateObject = {
                  is_forked: true,
                  parent_repo_id: insertRepos.dataValues.id,
                  is_suspicious:
                    (repo.is_private && !forkRepo.is_private) ||
                    insertRepos.dataValues.is_suspicious
                      ? true
                      : false,
                  review:
                    (repo.is_private && !forkRepo.is_private) ||
                    insertRepos.dataValues.is_suspicious
                      ? "suspicious auto"
                      : "no action",
                  reviewed_at:
                    (repo.is_private && !forkRepo.is_private) ||
                    insertRepos.dataValues.is_suspicious
                      ? moment.utc().format()
                      : null,
                  manual_review: false,
                };
                await Repositories.update(updateObject, {
                  where: {
                    source_repo_id: forkRepo.uuid,
                  },
                });
              }
            } else {
              let insertForkedRepo;
              if (!forkRepo.is_private) {
                insertForkedRepo = await Repositories.create({
                  source_type: "gitlab",
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
                  parent_repo_id: insertRepos
                    ? insertRepos.dataValues.id
                    : null,
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
                if (
                  bitbucketRepos.body.values[0].owner.uuid ==
                  forkRepo.owner.uuid
                ) {
                  await Users_repositories.create({
                    user_id: databaseUser.dataValues.id,
                    repository_id: insertForkedRepo.dataValues.id,
                  });
                }
              }
            }
          });
        }
      } else {
        if (repo.parent) {
          const ParentRepo = await request.get(
            `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}/${repo.parent.name}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
          );
          const findParentRepo = await Repositories.findOne({
            where: {
              source_repo_id: ParentRepo.body.uuid,
            },
          });
          if (!findParentRepo) {
            let insertParentRepo;
            if (!ParentRepo.body.is_private) {
              insertParentRepo = await Repositories.create({
                source_type: "gitlab",
                source_repo_id: ParentRepo.body.uuid,
                name: ParentRepo.body.name,
                url: ParentRepo.body.links.html.href,
                description: ParentRepo.body.description,
                is_private: ParentRepo.body.is_private,
                is_forked: ParentRepo.body.parent ? true : false,
                created_at: ParentRepo.body.created_on,
                updated_at: ParentRepo.body.updated_on,
                review: "pending",
              });
              if (
                bitbucketRepos.body.values[0].owner.uuid ==
                ParentRepo.body.owner.uuid
              ) {
                await Users_repositories.create({
                  user_id: databaseUser.dataValues.id,
                  repository_id: insertParentRepo.dataValues.id,
                });
              }
            }
            if (!repo.is_private) {
              await Repositories.update(
                {
                  parent_repo_id: insertParentRepo.dataValues.id,
                  is_suspicious:
                    ParentRepo.body.is_private && !repo.is_private
                      ? true
                      : false,
                  review:
                    ParentRepo.body.is_private && !repo.is_private
                      ? "suspicious auto"
                      : "no action",
                  reviewed_at:
                    ParentRepo.body.is_private && !repo.is_private
                      ? moment.utc().format()
                      : null,
                  manual_review: false,
                },
                {
                  where: {
                    id: findRepo.dataValues.id,
                  },
                }
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
        const forkedRepos = await request.get(
          `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}/${repo.name}/forks?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
        );
        if (forkedRepos.body.size != 0) {
          forkedRepos.body.values.map(async (forkRepo) => {
            const findChildRepo = await Repositories.findOne({
              where: {
                source_repo_id: forkRepo.uuid,
              },
            });
            if (findChildRepo) {
              if (!repo.is_private) {
                const updateObject = {
                  is_forked: true,
                  parent_repo_id: findRepo.dataValues.id,
                  is_suspicious:
                    (repo.is_private && !forkRepo.is_private) ||
                    findRepo.dataValues.is_suspicious
                      ? true
                      : false,
                  review:
                    (repo.is_private && !forkRepo.is_private) ||
                    findRepo.dataValues.is_suspicious
                      ? "suspicious auto"
                      : "no action",
                  reviewed_at:
                    (repo.is_private && !forkRepo.is_private) ||
                    findRepo.dataValues.is_suspicious
                      ? moment.utc().format()
                      : null,
                  manual_review: false,
                };
                await Repositories.update(updateObject, {
                  where: {
                    source_repo_id: forkRepo.uuid,
                  },
                });
              }
            } else {
              let insertForkedRepo;
              if (!forkRepo.is_private) {
                insertForkedRepo = await Repositories.create({
                  source_type: "gitlab",
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
                  parent_repo_id: findRepo.dataValues.id,
                  is_suspicious:
                    (repo.is_private && !forkRepo.is_private) ||
                    findRepo.dataValues.is_suspicious
                      ? true
                      : false,
                  review:
                    (repo.is_private && !forkRepo.is_private) ||
                    findRepo.dataValues.is_suspicious
                      ? "suspicious auto"
                      : "no action",
                  reviewed_at:
                    (repo.is_private && !forkRepo.is_private) ||
                    findRepo.dataValues.is_suspicious
                      ? moment.utc().format()
                      : null,
                });
                if (
                  bitbucketRepos.body.values[0].owner.uuid ==
                  forkRepo.owner.uuid
                ) {
                  await Users_repositories.create({
                    user_id: databaseUser.dataValues.id,
                    repository_id: insertForkedRepo.dataValues.id,
                  });
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
