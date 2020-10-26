const yup = require("yup");

module.exports.userIdSchema = () => {
  return yup.object().shape({
    user_id: yup.string().required({ user_id: "required" }),
  });
};

module.exports.userProjectSchema = () => {
  return yup.object().shape({
    user_id: yup.string().required({ user_id: "required" }),
    project_id: yup.string().required({ project_id: "required" }),
  });
};

module.exports.projectIdSchema = () => {
  return yup.object().shape({
    project_id: yup.string().required({ project_id: "required" }),
  });
};

module.exports.repositoryRemoveSchema = () => {
  return yup.object().shape({
    project_id: yup.string().required({ project_id: "required" }),
    repository_url: yup.string().required({ repository_url: "required" }),
  });
};

module.exports.repositoryInsertSchema = () => {
  return yup.object().shape({
    project_id: yup.string().required({ project_id: "required" }),
    repository_url: yup.string().required({ repository_url: "required" }),
    repository_details: yup
      .object()
      .required({ Repository_details: "required" }),
  });
};

module.exports.reviewSchema = () => {
  return yup.object().shape({
    repoIds: yup.array().required({ repoIds: "required" }),
    updatedAt: yup.string().required({ updatedAt: "required" }),
  });
};
