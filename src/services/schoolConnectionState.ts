let connectedSchoolProjectId: string | null = null;

export function getConnectedSchoolProjectId(): string | null {
  return connectedSchoolProjectId;
}

export function setConnectedSchoolProjectId(projectId: string | null): void {
  connectedSchoolProjectId = projectId;
}
