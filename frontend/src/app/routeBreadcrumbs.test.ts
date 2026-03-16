import { describe, expect, it } from "vitest";

import { getRouteBreadcrumb } from "./routeBreadcrumbs";

describe("getRouteBreadcrumb", () => {
  it("maps known patient route", () => {
    expect(getRouteBreadcrumb("/patients/appointments")).toBe("Home > Patients > Schedule Appointment");
  });

  it("falls back to Home for unknown paths", () => {
    expect(getRouteBreadcrumb("/unknown/path")).toBe("Home");
  });
});
