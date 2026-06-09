export type SchoolOnboardingStep = {
  id: string;
  /** i18n key under superAdmin */
  titleKey: string;
  descriptionKey: string;
  /** Shell command; omitted for manual-only steps */
  command?: string;
  manual?: boolean;
};

const REGISTRY_PLACEHOLDER = "<registry-project-id>";

/** Registry project id for deploy hints (falls back to placeholder). */
export function resolveRegistryProjectId(
  envProjectId?: string | null,
): string {
  const trimmed = envProjectId?.trim();
  return trimmed || REGISTRY_PLACEHOLDER;
}

/** One-liner run from repo root after Firebase CLI login. */
export function buildSchoolDeployCommand(
  projectId: string,
  options?: { seedSubscription?: boolean },
): string {
  const trimmed = projectId.trim();
  const seedFlag = options?.seedSubscription ? " --seed-subscription" : "";
  return `npm run onboard:school -- --project ${trimmed}${seedFlag}`;
}

/** Steps shown in super-admin onboarding wizard. */
export function buildSchoolOnboardingSteps(
  projectId: string,
  registryProjectId?: string | null,
): SchoolOnboardingStep[] {
  const project = projectId.trim() || "<school-project-id>";
  const registry = resolveRegistryProjectId(registryProjectId);
  const deployCmd = buildSchoolDeployCommand(project, {
    seedSubscription: true,
  });

  return [
    {
      id: "create-project",
      titleKey: "onboardingStepCreateProject",
      descriptionKey: "onboardingStepCreateProjectHint",
      manual: true,
    },
    {
      id: "enable-services",
      titleKey: "onboardingStepEnableServices",
      descriptionKey: "onboardingStepEnableServicesHint",
      manual: true,
    },
    {
      id: "web-app-config",
      titleKey: "onboardingStepWebApp",
      descriptionKey: "onboardingStepWebAppHint",
      manual: true,
    },
    {
      id: "deploy-school",
      titleKey: "onboardingStepDeploy",
      descriptionKey: "onboardingStepDeployHint",
      command: deployCmd,
    },
    {
      id: "register-registry",
      titleKey: "onboardingStepRegister",
      descriptionKey: "onboardingStepRegisterHint",
      manual: true,
    },
    {
      id: "sync-subscription",
      titleKey: "onboardingStepSyncSubscription",
      descriptionKey: "onboardingStepSyncSubscriptionHint",
      command: [
        `firebase use ${registry}`,
        "firebase deploy --only functions:registry:refreshSchoolSubscriptions",
        "# Then call refreshSchoolSubscriptions with {}",
      ].join("\n"),
    },
    {
      id: "first-admin",
      titleKey: "onboardingStepFirstAdmin",
      descriptionKey: "onboardingStepFirstAdminHint",
      manual: true,
    },
  ];
}

/** Individual firebase deploy commands (for docs / advanced use). */
export function buildSchoolDeployCommands(projectId: string): string[] {
  const project = projectId.trim();
  return [
    `firebase use ${project}`,
    "cd school-functions && npm install && npm run build && cd ..",
    "firebase deploy --config firebase.school.json --only firestore:rules,firestore:indexes",
    "firebase deploy --config firebase.school.json --only storage",
    "firebase deploy --config firebase.school.json --only functions:school:sendPushOnNotificationCreated",
  ];
}
