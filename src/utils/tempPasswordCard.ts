import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { DOMImplementation, XMLSerializer } from "@xmldom/xmldom";

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

export async function tempPasswordQrDataUrl(payload: TempPasswordSharePayload): Promise<string> {
  return QRCode.toDataURL(encodeTempPasswordPayload(payload), {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBarcodeSvg(value: string): string {
  try {
    const document = new DOMImplementation().createDocument(
      "http://www.w3.org/2000/svg",
      "svg",
      null,
    );
    const svgNode = document.documentElement;
    svgNode.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    JsBarcode(svgNode, value, {
      xmlDocument: document,
      format: "CODE128",
      displayValue: true,
      fontSize: 14,
      height: 60,
      margin: 8,
    });
    return new XMLSerializer().serializeToString(svgNode);
  } catch {
    return `<div class="value password">${escapeHtml(value)}</div>`;
  }
}

export async function buildTempPasswordPrintHtml(params: {
  schoolName?: string;
  userName: string;
  email: string;
  password: string;
  roleLabel: string;
}): Promise<string> {
  const payload = buildTempPasswordPayload({
    email: params.email,
    password: params.password,
    name: params.userName,
  });
  const qrDataUrl = await tempPasswordQrDataUrl(payload);
  const barcodeSvg = buildBarcodeSvg(params.password);
  const title = escapeHtml(params.schoolName?.trim() || "eduTrack");
  const name = escapeHtml(params.userName);
  const email = escapeHtml(params.email);
  const password = escapeHtml(params.password);
  const role = escapeHtml(params.roleLabel);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
    .card { max-width: 420px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 16px; padding: 24px; }
    h1 { font-size: 20px; margin: 0 0 8px; color: #1e3a8a; }
    .meta { font-size: 14px; color: #475569; margin-bottom: 16px; line-height: 1.5; }
    .label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 12px; }
    .value { font-size: 16px; margin-top: 4px; word-break: break-all; }
    .password { font-family: monospace; font-size: 22px; letter-spacing: 0.08em; font-weight: 700; }
    .codes { text-align: center; margin-top: 20px; }
    .codes img { width: 220px; height: 220px; }
    .barcode { margin-top: 16px; text-align: center; }
    .hint { margin-top: 18px; font-size: 12px; color: #64748b; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <div class="meta">Temporary login credentials</div>
    <div class="label">Name</div>
    <div class="value">${name}</div>
    <div class="label">Role</div>
    <div class="value">${role}</div>
    <div class="label">Email</div>
    <div class="value">${email}</div>
    <div class="label">Temporary password</div>
    <div class="value password">${password}</div>
    <div class="codes">
      <div class="label">Scan QR code</div>
      <img src="${qrDataUrl}" alt="Login QR code" />
      <div class="label">Barcode (password)</div>
      <div class="barcode">${barcodeSvg}</div>
    </div>
    <div class="hint">
      Give this card to the user in person. They must change this password after first sign-in.
      Destroy the card after use.
    </div>
  </div>
</body>
</html>`;
}
