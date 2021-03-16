var cron = require("node-cron");
const removeDuplicatReositories = require("../../../utils/removeDuplicatReositories");

export default async function removeDuplicatesRepositories(req, res) {
  //cron scheduler please remove cron job after job will run succesfully once.
  //please run the cron job after PR- 75 merge then you will merge a other PR's
  cron.schedule(process.env.REMOVE_DUPLICATE_REPO_SCHEDULE, async () => {
    await removeDuplicatReositories.removeDuplicatesRepositories();
  });
  res.status(200).json({
    message: "Cron job sucessfully set",
  });
}
