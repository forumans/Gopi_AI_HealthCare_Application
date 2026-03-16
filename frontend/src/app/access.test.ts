import { describe, expect, it } from "vitest";

import { requireRole } from "./access";

describe("requireRole", () => {
  it("returns null for allowed role", () => {
    expect(requireRole("ADMIN", ["ADMIN"])) .toBeNull();
  });

  it("returns denial message for disallowed role", () => {
    expect(requireRole("PATIENT", ["ADMIN"])) .toContain("Access denied");
  });
});
