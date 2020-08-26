import React from "react";
import Index from "./index";
import renderer from "react-test-renderer";

test("test case for index page", () => {
  const component = renderer.create(<Index />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
