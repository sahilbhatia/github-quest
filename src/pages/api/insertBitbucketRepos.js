const request = require("superagent");
const moment = require("moment");
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;

export default async function insertPublicRepos(req, res) {
  const insertRepos = async () => {
    const usersList = await Users.findAll({
      attributes: ["id", "bitbucket_handle", "last_fetched_at"],
      order: [["id", "ASC"]],
    });
    try {
      usersList.map(async (databaseUser) => {
        if (databaseUser.dataValues.bitbucket_handle) {
          const bitbucketRepos = await request.get(
            `https://api.bitbucket.org/2.0/repositories/${databaseUser.dataValues.bitbucket_handle}?access_token=${process.env.BITBUCKET_ACCESS_TOKEN}`
          );
          if (bitbucketRepos.status != 404) {
            await bitbucketRepos.body.values.map(async (repo) => {
              const findRepo = await Repositories.findOne({
                where: {
                  source_repo_id: repo.uuid,
                },
              });
              if (!findRepo) {
                const insertRepos = await Repositories.create({
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
                    const insertParentRepo = await Repositories.create({
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
                  } else {
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
                    } else {
                      const insertForkedRepo = await Repositories.create({
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
                  });
                }
              }
              // } else {
              //   if (
              //     new Date(
              //       moment(databaseUser.dataValues.last_fetched_at)
              //         .add(330, "minutes")
              //         .toISOString()
              //     ).valueOf() < new Date(repo.last_activity_at).valueOf()
              //   ) {
              //     const updateRepo = {
              //       name: repo.name,
              //       url: repo.web_url,
              //       description: repo.description,
              //       is_disabled: !repo.packages_enabled,
              //       is_archived: repo.archived,
              //       is_private: repo.visibility == "private" ? true : false,
              //       updated_at: repo.last_activity_at,
              //     };
              //     await Repositories.update(updateRepo, {
              //       where: {
              //         source_repo_id: repo.id,
              //       },
              //     });
              //   }
              //   if (repo.forks_count != 0) {
              //     const forkedRepos = await request
              //       .get(`https://gitlab.com/api/v4/projects/${repo.id}/forks`)
              //       .set({ "PRIVATE-TOKEN": "WeSGbGjMw6NXZVz6E_K7" });
              //     forkedRepos.body.map(async (forkRepo) => {
              //       const findForkedRepo = await Repositories.findOne({
              //         where: {
              //           source_repo_id: forkRepo.id,
              //         },
              //       });
              //       if (findForkedRepo) {
              //         const updateObject = {
              //           is_forked: true,
              //           parent_repo_id: findRepo.dataValues.id,
              //           is_suspicious:
              //             repo.visibility == "private" &&
              //               forkRepo.visibility != "private"
              //               ? true
              //               : false,
              //           review:
              //             repo.visibility == "private" &&
              //               forkRepo.visibility != "private"
              //               ? "suspicious auto"
              //               : "no action",
              //           reviewed_at:
              //             repo.visibility == "private" &&
              //               forkRepo.visibility != "private"
              //               ? moment.utc().format()
              //               : null,
              //           manual_review: false,
              //           updated_at: forkRepo.last_activity_at,
              //         };
              //         await Repositories.update(updateObject, {
              //           where: {
              //             source_repo_id: forkRepo.id,
              //           },
              //         });
              //       } else {
              //         const insertForkedRepo = await Repositories.create({
              //           source_type: "gitlab",
              //           source_repo_id: forkRepo.id,
              //           name: forkRepo.name,
              //           url: forkRepo.web_url,
              //           description: forkRepo.description,
              //           is_disabled: !forkRepo.packages_enabled,
              //           is_archived: forkRepo.archived,
              //           is_private:
              //             forkRepo.visibility == "private" ? true : false,
              //           is_forked: true,
              //           created_at: forkRepo.created_at,
              //           updated_at: forkRepo.last_activity_at,
              //           parent_repo_id: findRepo.dataValues.id,
              //           is_suspicious:
              //             repo.visibility == "private" &&
              //               forkRepo.visibility != "private"
              //               ? true
              //               : false,
              //           review:
              //             repo.visibility == "private" &&
              //               forkRepo.visibility != "private"
              //               ? "suspicious auto"
              //               : "no action",
              //           reviewed_at:
              //             repo.visibility == "private" &&
              //               forkRepo.visibility != "private"
              //               ? moment.utc().format()
              //               : null,
              //         });
              //         if (gitlabUser.body[0].id == forkRepo.creator_id) {
              //           await Users_repositories.create({
              //             user_id: databaseUser.dataValues.id,
              //             repository_id: insertForkedRepo.dataValues.id,
              //           });
              //         }
              //       }
              //     });
              //   }
              // }
            });
          } else {
            await Users.update(
              {
                error_details:
                  "repositories not fetch for given bitbucket handle",
              },
              {
                where: {
                  id: databaseUser.dataValues.id,
                },
              }
            );
          }
          await Users.update(
            { last_fetched_at: moment.utc().format() },
            {
              returning: true,
              plain: true,
              where: { id: databaseUser.dataValues.id },
            }
          );
        }
      });
    } catch {
      return;
    }
  };
  insertRepos();
  res.status(200).json({
    message: "cron Job Activated successfully for inserting repositories",
  });
}
