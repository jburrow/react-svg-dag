/**
 * @jest-environment jsdom
 */

import { DAGSVGComponent } from "./index";

import * as React from "react";

import { create } from "react-test-renderer";

test("<DAGSVGComponent />", () => {
  const component = create(<DAGSVGComponent nodes={[]} />);
  expect(1).toBe(1);
});
