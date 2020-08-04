var cron = require("node-cron");
const request = require("superagent");
const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Users = db.users;
const Roles = db.roles;

export default async function insertUsers(req, res) {

  const insertUsersFunction = async () => {
    const intranetUsersList = await request
      .get("https://stage-intranet.joshsoftware.com/api/v1/users")
      .set({
        "Content-Type": "application/json",
        "Accept": "application/json"
      });
    const listOfUsers = await JSON.parse(intranetUsersList.text);
    const insertUsersList = await listOfUsers.users.map(async (item) => {
      const find_user = await Users.findOne({
        where: {
          email: item.email,
        }
      })
      if (!find_user) {
        const get_github_handle = () => {
          if (item.public_profile) {
            if (!item.public_profile.github_handle) {
              return null;
            } else if (item.public_profile.github_handle.includes("/")) {
              if (item.public_profile.github_handle.includes("?")) {
                let url = item.public_profile.github_handle;
                let newUrl = url.split("/").pop();
                return newUrl.split("?")[0];
              } else {
                let url = item.public_profile.github_handle;
                return url.split("/").pop();
              }
            } else {
              return item.public_profile.github_handle;
            }
          } else {
            return null;
          }
        }
        try {
          const github_handle = await get_github_handle();
          const role = await Roles.findOne({
            where: {
              role: item.role,
            }
          })
         await Users.create({
            name: item.name ? item.name : "unknown",
            role_id: role.dataValues.id,
            email: item.email,
            github_handle: github_handle,
            org_user_id: item.id
          });
        } catch(err) {
          return
        }
      } else if (find_user && item.public_profile) {
        try {
          const get_github_handle = () => {
            if (item.public_profile) {
              if (!item.public_profile.github_handle) {
                return null;
              } else if (item.public_profile.github_handle.includes("/")) {
                if (item.public_profile.github_handle.includes("?")) {
                  let url = item.public_profile.github_handle;
                  let newUrl = url.split("/").pop();
                  return newUrl.split("?")[0];
                } else {
                  let url = item.public_profile.github_handle;
                  return url.split("/").pop();
                }
              } else {
                return item.public_profile.github_handle;
              }
            } else {
              return null;
            }
          }
          const github_handle = await get_github_handle();
          if (find_user.dataValues.github_handle != github_handle) {
            await Users.update({
              name: item.name ? item.name : "unknown",
              github_handle: item.public_profile ? github_handle : null,
            }, {
              returning: true,
              where: { email: item.email },
            })
          }
        } catch {
          return;
        }
      }
    });

    await Promise.all(insertUsersList)
  }
   cron.schedule(process.env.INSERT_USERS_FROM_INTRANET, async () => {
     insertUsersFunction();
   });
 insertUsersFunction();
  res.status(200).json({
    message: "cron Job Activated successfully for inserting users"
  })
};
