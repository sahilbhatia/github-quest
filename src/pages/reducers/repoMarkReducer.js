module.exports.repoMarkState = {
  checkAll: false,
  actionDisabled: true,
  commentDisabled: true,
};

module.exports.repoMarkReducer = (state, action) => {
  switch (action.type) {
    case "CHECK_ALL":
      return {
        ...state,
        checkAll: action.payload,
      };
    case "ACTION_DISABLED":
      return {
        ...state,
        actionDisabled: action.payload,
      };
    case "COMMENT_DISABLED":
      return {
        ...state,
        commentDisabled: action.payload,
      };
    default:
      return state;
  }
};
