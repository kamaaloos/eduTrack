import QRCode from "qrcode";
import {
  buildTempPasswordPayload,
  encodeTempPasswordPayload,
  type TempPasswordSharePayload,
} from "./tempPasswordCardCore";

async function tempPasswordQrSvg(payload: TempPasswordSharePayload): Promise<string> {
  return QRCode.toString(encodeTempPasswordPayload(payload), {
    type: "svg",
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

export async function buildTempPasswordPrintHtml(params: {
  schoolName?: string;
  appName?: string;
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
  const qrSvg = await tempPasswordQrSvg(payload);
  const title = escapeHtml(params.schoolName?.trim() || params.appName?.trim() || "eduTrack");
  const appName = escapeHtml(params.appName?.trim() || "eduTrack");
  const name = escapeHtml(params.userName);
  const email = escapeHtml(params.email);
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
    .codes { text-align: center; margin-top: 20px; }
    .codes svg { width: 220px; height: 220px; display: block; margin: 0 auto; }
    .hint { margin-top: 18px; font-size: 12px; color: #64748b; line-height: 1.5; }
    .secure { margin-top: 14px; font-size: 12px; color: #b45309; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 10px 12px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <div class="meta">Temporary login card</div>
    <div class="label">Name</div>
    <div class="value">${name}</div>
    <div class="label">Role</div>
    <div class="value">${role}</div>
    <div class="label">Email</div>
    <div class="value">${email}</div>
    <div class="codes">
      <div class="label">Scan on sign-in</div>
      ${qrSvg}
    </div>
    <div class="secure">
      The password is not printed on this card. The user scans the QR code on the ${appName} sign-in screen.
      Give this card in person only. Destroy it after first sign-in.
    </div>
    <div class="hint">
      Admin: the temporary password is shown only in the app before printing, not on this page.
    </div>
  </div>
</body>
</html>`;
}
