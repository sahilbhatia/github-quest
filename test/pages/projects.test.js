import React from "react";
import { render } from "@testing-library/react";

import Projects from "../../pages/projects";

describe("Recognition text Component test", () => {
  test("should equal snapshot", () => {
    const { asFragment } = render(
      <Projects />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});