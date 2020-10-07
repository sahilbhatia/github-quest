var cron = require("node-cron");
const fetchProjects = require("../../../utils/fetchProjects");

export default async function insertProjects(req, res) {
  //cron scheduler
  cron.schedule(process.env.INSERT_PROJECTS_SCHEDULE, async () => {
    await fetchProjects.addProjects();
  });

  await fetchProjects.addIntranetProjects(res);
}
