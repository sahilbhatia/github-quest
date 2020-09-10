const request = require("superagent");
const { headers } = require("../../../constants/githubHeader");
const moment = require("moment");
const dbConn = require("../../../models/sequelize");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;

module.exports.insertGithubRepos = async (databaseUser) => {
  const getRepoForSpecificUser = async () => {
    let usersRepos;
    if (databaseUser.dataValues.last_fetched_at) {
      try {
        usersRepos = await request
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
      } catch {
        return null;
      }
    } else {
      try {
        usersRepos = await request
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
      } catch {
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
    }
  };
  const data = await getRepoForSpecificUser();
  if (data) {
    const mapData = await data.body.map(async (item) => {
      const result = await Repositories.findAll({
        where: { source_repo_id: item.id.toString() },
        order: [["id", "ASC"]],
      });
      if (result.length === 0 && item.fork === false) {
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

          await Users_repositories.create({
            user_id: databaseUser.dataValues.id,
            repository_id: insertRepos.dataValues.id,
          });
        } catch {
          await Users.update(
            {
              error_details: "error comes while inserting repositories ",
            },
            {
              where: {
                id: databaseUser.dataValues.id,
              },
            }
          );
          return;
        }
      } else if (result.length === 0 && item.fork == true) {
        try {
          let insertParentRepositories;
          const parentRepo = await request
            .get(
              `https://api.github.com/repos/${databaseUser.dataValues.github_handle}/${item.name}`
            )
            .set(headers);

          insertParentRepositories = await Repositories.findOne({
            where: {
              source_repo_id: parentRepo.body.parent.id.toString(),
            },
          });
          if (insertParentRepositories) {
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

              await Users_repositories.create({
                user_id: databaseUser.dataValues.id,
                repository_id: insertRepos.dataValues.id,
              });

              const insertSuspiciousChildRepos = async () => {
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
                              repository_id:
                                insertParentRepositories.dataValues.id,
                            });
                          } catch {
                            await Users.update(
                              {
                                error_details:
                                  "error comes while fetching repositories",
                              },
                              {
                                where: {
                                  id: databaseUser.dataValues.id,
                                },
                              }
                            );
                            return;
                          }
                        }
                      } catch {
                        await Users.update(
                          {
                            error_details:
                              "error comes while inserting repositories",
                          },
                          {
                            where: {
                              id: databaseUser.dataValues.id,
                            },
                          }
                        );
                        return;
                      }
                    });
                    return;
                  } catch {
                    await Users.update(
                      {
                        error_details:
                          "error comes while fetching forks repositories",
                      },
                      {
                        where: {
                          id: databaseUser.dataValues.id,
                        },
                      }
                    );
                    return;
                  }
                } else {
                  return;
                }
              };

              await insertSuspiciousChildRepos();

              await Repositories.update(
                {
                  review: "pending",
                },
                {
                  returning: true,
                  where: { id: insertParentRepositories.dataValues.id },
                }
              );
            } catch {
              await Repositories.update(
                {
                  error_details: "error came while updating repositories",
                },
                {
                  where: {
                    where: { id: insertParentRepositories.dataValues.id },
                  },
                }
              );
              return;
            }
          } else {
            try {
              insertParentRepositories = await Repositories.create({
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

              let userObject = await Users.findOne({
                where: {
                  github_handle: parentRepo.body.parent.owner.login,
                },
              });

              if (userObject) {
                try {
                  await Users_repositories.create({
                    user_id: userObject.dataValues.id,
                    repository_id: insertParentRepositories.dataValues.id,
                  });
                } catch {
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
                  return;
                }
              }

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
                is_suspicious: insertParentRepositories.dataValues.is_private,
                review: insertParentRepositories.dataValues.is_private
                  ? "suspicious auto"
                  : "no action",
                reviewed_at: insertParentRepositories.dataValues.is_private
                  ? moment.utc().format()
                  : null,
              });

              await Users_repositories.create({
                user_id: databaseUser.dataValues.id,
                repository_id: insertRepos.dataValues.id,
              });

              const insertSuspiciousChildRepos = async () => {
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
                          is_forked: value.fork,
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
                              repository_id:
                                insertParentRepositories.dataValues.id,
                            });
                          } catch {
                            await Users.update(
                              {
                                error_details:
                                  "error comes while inserting repositories",
                              },
                              {
                                where: {
                                  id: databaseUser.dataValues.id,
                                },
                              }
                            );
                            return;
                          }
                        }
                      } catch {
                        await Users.update(
                          {
                            error_details:
                              "error comes while inserting repositories",
                          },
                          {
                            where: {
                              id: databaseUser.dataValues.id,
                            },
                          }
                        );
                        return;
                      }
                    });
                    return;
                  } catch {
                    await Users.update(
                      {
                        error_details:
                          "error comes while fetching forks repositories",
                      },
                      {
                        where: {
                          id: databaseUser.dataValues.id,
                        },
                      }
                    );
                    return;
                  }
                } else {
                  return;
                }
              };
              await insertSuspiciousChildRepos();
            } catch {
              await Repositories.update(
                {
                  error_details: "error came while updating repositories",
                },
                {
                  where: {
                    where: {
                      source_repo_id: result[0].dataValues.source_repo_id.toString(),
                    },
                  },
                }
              );
              return;
            }
          }
        } catch (err) {
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
          await Users_repositories.create({
            user_id: databaseUser.dataValues.id,
            repository_id: insertRepos.dataValues.id,
          });
        }
      } else if (result.length === 1 && item.fork == false) {
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
              review: "pending",
            },
            {
              returning: true,
              where: {
                source_repo_id: result[0].dataValues.source_repo_id.toString(),
              },
            }
          );
        } catch {
          await Repositories.update(
            {
              error_details: "error came while updating repositories",
            },
            {
              where: {
                where: {
                  source_repo_id: result[0].dataValues.source_repo_id.toString(),
                },
              },
            }
          );
          return;
        }
      } else if (result.length === 1 && item.fork == true) {
        try {
          let parentRepo;
          const get_parentRepo_data = async () => {
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
          };
          let insertParentRepositories = await get_parentRepo_data();

          await Repositories.findOne({
            where: { parent_repo_id: result[0].dataValues.id },
          });

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
        } catch {
          await Repositories.update(
            {
              error_details: "error came while updating repositories",
            },
            {
              where: {
                where: {
                  source_repo_id: result[0].dataValues.source_repo_id.toString(),
                },
              },
            }
          );
          return;
        }
      }
    });
    try {
      await Promise.all(mapData);
      await Users.update(
        { last_fetched_at: moment.utc().format() },
        {
          returning: true,
          plain: true,
          where: { id: databaseUser.dataValues.id },
        }
      );
    } catch {
      await Users.update(
        {
          error_details: "error comes while updating user",
        },
        {
          where: {
            id: databaseUser.dataValues.id,
          },
        }
      );
      return;
    }
  }
  return;
};
