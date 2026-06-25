import {
  buildSchoolDeployCommand,
  buildSchoolDeployCommands,
  buildSchoolOnboardingSteps,
  buildSchoolProvisionCommand,
  resolveRegistryProjectId,
} from "../src/utils/schoolOnboardingCommands";

describe("schoolOnboardingCommands", () => {
  it("builds deploy one-liner with optional seed flag", () => {
    expect(buildSchoolDeployCommand("edutrack-school-2")).toBe(
      "npm run onboard:school -- --project edutrack-school-2",
    );
    expect(
      buildSchoolDeployCommand("edutrack-school-2", { seedSubscription: true }),
    ).toBe(
      "npm run onboard:school -- --project edutrack-school-2 --seed-subscription",
    );
  });

  it("builds provision one-liner with dry-run and admin flags", () => {
    expect(buildSchoolProvisionCommand("scripts/foo.json")).toBe(
      "npm run provision:school -- scripts/foo.json",
    );
    expect(
      buildSchoolProvisionCommand("scripts/foo.json", { dryRun: true }),
    ).toBe("npm run provision:school -- scripts/foo.json --dry-run");
    expect(
      buildSchoolProvisionCommand(undefined, {
        adminEmail: "admin@school.example",
      }),
    ).toContain("--admin-email admin@school.example");
  });

  it("includes manual and automated onboarding steps", () => {
    const steps = buildSchoolOnboardingSteps("demo-school", "edutrack-694ec");
    expect(steps.length).toBeGreaterThanOrEqual(8);
    expect(steps.find((s) => s.id === "provision-school")?.command).toContain(
      "provision:school",
    );
    expect(steps.find((s) => s.id === "deploy-school")?.command).toContain(
      "demo-school",
    );
    expect(steps.find((s) => s.id === "create-project")?.manual).toBe(true);
  });

  it("falls back registry project placeholder", () => {
    expect(resolveRegistryProjectId("")).toBe("<registry-project-id>");
    expect(resolveRegistryProjectId("edutrack-694ec")).toBe("edutrack-694ec");
  });

  it("lists granular firebase deploy commands", () => {
    const cmds = buildSchoolDeployCommands("school-a");
    expect(cmds[0]).toBe("firebase use school-a");
    expect(cmds.some((c) => c.includes("firestore:rules,firestore:indexes"))).toBe(
      true,
    );
    expect(cmds.some((c) => c.includes("functions:school"))).toBe(true);
  });
});
