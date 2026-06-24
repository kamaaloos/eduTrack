export type TempPasswordSharePayload = {
  type: "edutrack-temp-login";
  v: 1;
  email: string;
  password: string;
  name?: string;
};

export function buildTempPasswordPayload(params: {
  email: string;
  password: string;
  name?: string;
}): TempPasswordSharePayload {
  return {
    type: "edutrack-temp-login",
    v: 1,
    email: params.email.trim().toLowerCase(),
    password: params.password,
    name: params.name?.trim() || undefined,
  };
}

export function encodeTempPasswordPayload(payload: TempPasswordSharePayload): string {
  return JSON.stringify(payload);
}

export function parseTempPasswordQrData(
  raw: string,
): TempPasswordSharePayload | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as Partial<TempPasswordSharePayload>;
    if (parsed.type !== "edutrack-temp-login" || parsed.v !== 1) {
      return null;
    }
    if (typeof parsed.email !== "string" || typeof parsed.password !== "string") {
      return null;
    }
    const email = parsed.email.trim().toLowerCase();
    const password = parsed.password;
    if (!email || !password) return null;

    return {
      type: "edutrack-temp-login",
      v: 1,
      email,
      password,
      name:
        typeof parsed.name === "string" && parsed.name.trim()
          ? parsed.name.trim()
          : undefined,
    };
  } catch {
    return null;
  }
}
