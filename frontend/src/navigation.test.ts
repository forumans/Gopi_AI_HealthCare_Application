import { describe, expect, it } from "vitest";

import { breadcrumb, menuToView } from "./navigation";

describe("navigation helpers", () => {
  it("maps schedule menu to patient schedule view", () => {
    expect(menuToView("Schedule / Cancel Appointment")).toBe("patient-schedule");
  });

  it("builds breadcrumb string", () => {
    expect(breadcrumb(["Home", "Doctors", "Appointments"])).toBe("Home > Doctors > Appointments");
  });
});
