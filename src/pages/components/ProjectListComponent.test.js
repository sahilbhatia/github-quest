import React from "react";
import Component from "./ProjectListComponent";
import renderer from "react-test-renderer";

test("test case for project list component", () => {
  const component = renderer.create(<Component data={{
    projects: [
      {
        id: 5,
        org_project_id: "53ecc4c94a6f7301790e0000",
        name: "AceMoney V1",
        is_active: false,
        project_manager: null,
        created_at: "2020-08-20T04:51:29.921Z",
        updated_at: "2020-08-20T04:51:29.921Z",
        users_projects: [],
        projects_repositories: []
      },
      {
        id: 6,
        org_project_id: "53ecc4c94a6f7301790e0001",
        name: "AceMoney V2",
        is_active: false,
        project_manager: null,
        created_at: "2020-08-20T04:51:29.921Z",
        updated_at: "2020-08-20T04:51:29.921Z",
        users_projects: [],
        projects_repositories: []
      },
    ],
    date: { min: "2020-08-20T04:51:29.909Z" }
  }}/>);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
