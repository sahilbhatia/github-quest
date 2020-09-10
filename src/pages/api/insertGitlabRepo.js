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
      attributes: ["id", "gitlab_handle", "last_fetched_at"],
      order: [["id", "ASC"]],
    });
    try {
      usersList.map(async (databaseUser) => {
        if (databaseUser.dataValues.gitlab_handle) {
          const gitlabUser = await request.get(
            `https://gitlab.com/api/v4/users?username=${databaseUser.dataValues.gitlab_handle}`
          );
          if (gitlabUser.body.length != 0) {
            const gitlabRepos = await request
              .get(
                `https://gitlab.com/api/v4/users/${gitlabUser.body[0].id}/projects`
              )
              .set({ "PRIVATE-TOKEN": "WeSGbGjMw6NXZVz6E_K7" });
            await gitlabRepos.body.map(async (repo) => {
              const findRepo = await Repositories.findOne({
                where: {
                  source_repo_id: repo.id.toString(),
                },
              });
              if (!findRepo) {
                const insertRepos = await Repositories.create({
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
                await Users_repositories.create({
                  user_id: databaseUser.dataValues.id,
                  repository_id: insertRepos.dataValues.id,
                });
                if (repo.forked_from_project) {
                  const ParentRepo = await request
                    .get(
                      `https://gitlab.com/api/v4/projects/${repo.forked_from_project.id}`
                    )
                    .set({ "PRIVATE-TOKEN": "WeSGbGjMw6NXZVz6E_K7" });
                  const findRepo = await Repositories.findOne({
                    where: {
                      source_repo_id: ParentRepo.body.id.toString(),
                    },
                  });
                  if (!findRepo) {
                    const insertParentRepo = await Repositories.create({
                      source_type: "gitlab",
                      source_repo_id: ParentRepo.body.id,
                      name: ParentRepo.body.name,
                      url: ParentRepo.body.web_url,
                      description: ParentRepo.body.description,
                      is_disabled: !ParentRepo.body.packages_enabled,
                      is_archived: ParentRepo.body.archived,
                      is_private:
                        ParentRepo.body.visibility == "private" ? true : false,
                      is_forked: ParentRepo.body.forked_from_project
                        ? true
                        : false,
                      created_at: ParentRepo.body.created_at,
                      updated_at: ParentRepo.body.last_activity_at,
                      review: "pending",
                    });
                    if (gitlabUser.body[0].id == ParentRepo.creator_id) {
                      await Users_repositories.create({
                        user_id: databaseUser.dataValues.id,
                        repository_id: insertParentRepo.dataValues.id,
                      });
                    }
                    await Repositories.update(
                      {
                        parent_repo_id: insertParentRepo.dataValues.id,
                        is_suspicious:
                          ParentRepo.body.visibility == "private" &&
                          repo.visibility != "private"
                            ? true
                            : false,
                        review:
                          ParentRepo.body.visibility == "private" &&
                          repo.visibility != "private"
                            ? "suspicious auto"
                            : "no action",
                        reviewed_at:
                          ParentRepo.body.visibility == "private" &&
                          repo.visibility != "private"
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
                if (repo.forks_count != 0) {
                  const forkedRepos = await request
                    .get(`https://gitlab.com/api/v4/projects/${repo.id}/forks`)
                    .set({ "PRIVATE-TOKEN": "WeSGbGjMw6NXZVz6E_K7" });
                  forkedRepos.body.map(async (forkRepo) => {
                    const findRepo = await Repositories.findOne({
                      where: {
                        source_repo_id: forkRepo.id.toString(),
                      },
                    });
                    if (findRepo) {
                      const updateObject = {
                        is_forked: true,
                        parent_repo_id: insertRepos.dataValues.id,
                        is_suspicious:
                          (repo.visibility == "private" &&
                            forkRepo.visibility != "private") ||
                          insertRepos.dataValues.is_suspicious
                            ? true
                            : false,
                        review:
                          (repo.visibility == "private" &&
                            forkRepo.visibility != "private") ||
                          insertRepos.dataValues.is_suspicious
                            ? "suspicious auto"
                            : "no action",
                        reviewed_at:
                          (repo.visibility == "private" &&
                            forkRepo.visibility != "private") ||
                          insertRepos.dataValues.is_suspicious
                            ? moment.utc().format()
                            : null,
                        manual_review: false,
                      };
                      await Repositories.update(updateObject, {
                        where: {
                          source_repo_id: forkRepo.id.toString(),
                        },
                      });
                    } else {
                      const insertForkedRepo = await Repositories.create({
                        source_type: "gitlab",
                        source_repo_id: forkRepo.id,
                        name: forkRepo.name,
                        url: forkRepo.web_url,
                        description: forkRepo.description,
                        is_disabled: !forkRepo.packages_enabled,
                        is_archived: forkRepo.archived,
                        is_private:
                          forkRepo.visibility == "private" ? true : false,
                        is_forked: true,
                        created_at: forkRepo.created_at,
                        updated_at: forkRepo.last_activity_at,
                        parent_repo_id: insertRepos.dataValues.id,
                        is_suspicious:
                          (repo.visibility == "private" &&
                            forkRepo.visibility != "private") ||
                          insertRepos.dataValues.is_suspicious
                            ? true
                            : false,
                        review:
                          (repo.visibility == "private" &&
                            forkRepo.visibility != "private") ||
                          insertRepos.dataValues.is_suspicious
                            ? "suspicious auto"
                            : "no action",
                        reviewed_at:
                          (repo.visibility == "private" &&
                            forkRepo.visibility != "private") ||
                          insertRepos.dataValues.is_suspicious
                            ? moment.utc().format()
                            : null,
                      });
                      if (gitlabUser.body[0].id == forkRepo.creator_id) {
                        await Users_repositories.create({
                          user_id: databaseUser.dataValues.id,
                          repository_id: insertForkedRepo.dataValues.id,
                        });
                      }
                    }
                  });
                }
              } else {
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
                if (repo.forked_from_project) {
                  const ParentRepo = await request
                    .get(
                      `https://gitlab.com/api/v4/projects/${repo.forked_from_project.id}`
                    )
                    .set({ "PRIVATE-TOKEN": "WeSGbGjMw6NXZVz6E_K7" });
                  const findParentRepo = await Repositories.findOne({
                    where: {
                      source_repo_id: ParentRepo.body.id.toString(),
                    },
                  });
                  if (!findParentRepo) {
                    const insertParentRepo = await Repositories.create({
                      source_type: "gitlab",
                      source_repo_id: ParentRepo.body.id,
                      name: ParentRepo.body.name,
                      url: ParentRepo.body.web_url,
                      description: ParentRepo.body.description,
                      is_disabled: !ParentRepo.body.packages_enabled,
                      is_archived: ParentRepo.body.archived,
                      is_private:
                        ParentRepo.body.visibility == "private" ? true : false,
                      is_forked: ParentRepo.body.forked_from_project
                        ? true
                        : false,
                      created_at: ParentRepo.body.created_at,
                      updated_at: ParentRepo.body.last_activity_at,
                      review: "pending",
                    });
                    if (gitlabUser.body[0].id == ParentRepo.creator_id) {
                      await Users_repositories.create({
                        user_id: databaseUser.dataValues.id,
                        repository_id: insertParentRepo.dataValues.id,
                      });
                    }
                    await Repositories.update(
                      {
                        parent_repo_id: insertParentRepo.dataValues.id,
                        is_suspicious:
                          ParentRepo.body.visibility == "private" &&
                          repo.visibility != "private"
                            ? true
                            : false,
                        review:
                          ParentRepo.body.visibility == "private" &&
                          repo.visibility != "private"
                            ? "suspicious auto"
                            : "no action",
                        reviewed_at:
                          ParentRepo.body.visibility == "private" &&
                          repo.visibility != "private"
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
                if (repo.forks_count != 0) {
                  const forkedRepos = await request
                    .get(`https://gitlab.com/api/v4/projects/${repo.id}/forks`)
                    .set({ "PRIVATE-TOKEN": "WeSGbGjMw6NXZVz6E_K7" });
                  forkedRepos.body.map(async (forkRepo) => {
                    const findForkedRepo = await Repositories.findOne({
                      where: {
                        source_repo_id: forkRepo.id.toString(),
                      },
                    });
                    if (findForkedRepo) {
                      const updateObject = {
                        is_forked: true,
                        parent_repo_id: findRepo.dataValues.id,
                        is_suspicious:
                          repo.visibility == "private" &&
                          forkRepo.visibility != "private"
                            ? true
                            : false,
                        review:
                          repo.visibility == "private" &&
                          forkRepo.visibility != "private"
                            ? "suspicious auto"
                            : "no action",
                        reviewed_at:
                          repo.visibility == "private" &&
                          forkRepo.visibility != "private"
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
                    } else {
                      const insertForkedRepo = await Repositories.create({
                        source_type: "gitlab",
                        source_repo_id: forkRepo.id,
                        name: forkRepo.name,
                        url: forkRepo.web_url,
                        description: forkRepo.description,
                        is_disabled: !forkRepo.packages_enabled,
                        is_archived: forkRepo.archived,
                        is_private:
                          forkRepo.visibility == "private" ? true : false,
                        is_forked: true,
                        created_at: forkRepo.created_at,
                        updated_at: forkRepo.last_activity_at,
                        parent_repo_id: findRepo.dataValues.id,
                        is_suspicious:
                          repo.visibility == "private" &&
                          forkRepo.visibility != "private"
                            ? true
                            : false,
                        review:
                          repo.visibility == "private" &&
                          forkRepo.visibility != "private"
                            ? "suspicious auto"
                            : "no action",
                        reviewed_at:
                          repo.visibility == "private" &&
                          forkRepo.visibility != "private"
                            ? moment.utc().format()
                            : null,
                      });
                      if (gitlabUser.body[0].id == forkRepo.creator_id) {
                        await Users_repositories.create({
                          user_id: databaseUser.dataValues.id,
                          repository_id: insertForkedRepo.dataValues.id,
                        });
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
