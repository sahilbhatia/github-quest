var cron = require("node-cron");
const request = require("superagent");
const dbConn = require("../../../models/sequelize");
const { headers } = require("../../../constants/intranetHeader");
dbConn.sequelize;
const db = require("../../../models/sequelize");
const Users = db.users;
const Roles = db.roles;

//function for get valid git handle
const getValidGitHandle = (gitHandle) => {
  if (!gitHandle) {
    return null;
  } else {
    if (gitHandle.includes("/")) {
      if (gitHandle.includes("?")) {
        let url = gitHandle;
        let newUrl = url.split("/").pop();
        return newUrl.split("?")[0];
      } else {
        let url = gitHandle;
        return url.split("/").pop();
      }
    } else {
      return gitHandle;
    }
  }
};

//find user
const findUser = async (email) => {
  const user = await Users.findOne({
    where: {
      email: email,
    },
  });
  if (!user) {
    return false;
  } else {
    return user;
  }
};

//function for new user
const newUser = async (item) => {
  try {
    //get valid git handles
    const github_handle = item.public_profile
      ? await getValidGitHandle(item.public_profile.github_handle)
      : null;
    const gitlab_handle = item.public_profile
      ? await getValidGitHandle(item.public_profile.gitlab_handle)
      : null;
    const bitbucket_handle = item.public_profile
      ? await getValidGitHandle(item.public_profile.bitbucket_handle)
      : null;

    const role = await Roles.findOne({
      where: {
        role: item.role,
      },
    });
    await Users.create({
      name: item.name ? item.name : "unknown",
      role_id: role.dataValues.id,
      email: item.email,
      github_handle: github_handle,
      gitlab_handle: gitlab_handle,
      bitbucket_handle: bitbucket_handle,
      org_user_id: item.id,
    });
  } catch {
    return false;
  }
};

//function for existing user
const existUser = async (item, find_user) => {
  try {
    //get valid git handles
    const github_handle = await getValidGitHandle(
      item.public_profile.github_handle
    );
    const gitlab_handle = await getValidGitHandle(
      item.public_profile.gitlab_handle
    );
    const bitbucket_handle = await getValidGitHandle(
      item.public_profile.bitbucket_handle
    );
    if (
      find_user.dataValues.github_handle != github_handle ||
      find_user.dataValues.gitlab_handle != gitlab_handle ||
      find_user.dataValues.bitbucket_handle != bitbucket_handle
    ) {
      await Users.update(
        {
          name: item.name ? item.name : "unknown",
          github_handle: github_handle,
          gitlab_handle: gitlab_handle,
          bitbucket_handle: bitbucket_handle,
        },
        {
          returning: true,
          where: { email: item.email },
        }
      );
    }
  } catch {
    return false;
  }
};

export default async function insertUsers(req, res) {
  //function for insert users from intranet
  const insertUsersFunction = async () => {
    const intranetUsersList = await request
      .get(process.env.INTRANET_USER_API)
      .set(headers);

    const listOfUsers = await JSON.parse(intranetUsersList.text);

    //iterate user list
    const insertUsersList = await listOfUsers.users.map(async (item) => {
      try {
        const find_user = await findUser(item.email);
        if (!find_user) {
          await newUser(item);
        } else if (find_user && item.public_profile) {
          await existUser(item, find_user);
        }
      } catch {
        return false;
      }
    });
    await Promise.all(insertUsersList);
  };

  //cron scheduler
  cron.schedule(process.env.INSERT_USERS_FROM_INTRANET, async () => {
    insertUsersFunction();
  });
  //call insert user function
  insertUsersFunction();

  res.status(200).json({
    message: "cron Job Activated successfully for inserting users",
  });
}
