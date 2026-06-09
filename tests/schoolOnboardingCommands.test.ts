import {
  buildSchoolDeployCommand,
  buildSchoolDeployCommands,
  buildSchoolOnboardingSteps,
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

  it("includes manual and automated onboarding steps", () => {
    const steps = buildSchoolOnboardingSteps("demo-school", "edutrack-694ec");
    expect(steps.length).toBeGreaterThanOrEqual(6);
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
  });
});
