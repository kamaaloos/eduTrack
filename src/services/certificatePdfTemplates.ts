import { escapeHtml } from "../utils/htmlEscape";
import { getGrade } from "../utils/letterGrade";

const BASE_STYLES = `
  body { font-family: Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; }
  .page { page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .border { border: 2px solid #1e3a8a; border-radius: 12px; padding: 28px; min-height: 720px; box-sizing: border-box; }
  .school { text-align: center; color: #1e3a8a; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .title { text-align: center; font-size: 28px; font-weight: 800; color: #1e40af; margin: 18px 0 8px; }
  .subtitle { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 28px; }
  .student { text-align: center; font-size: 22px; font-weight: 700; margin: 12px 0 4px; }
  .meta { text-align: center; color: #475569; font-size: 14px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
  th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
  th { background: #eff6ff; color: #1e3a8a; font-weight: 700; }
  .summary { margin-top: 20px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .chip { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 999px; padding: 8px 14px; font-size: 13px; font-weight: 700; color: #1d4ed8; }
  .footer { margin-top: 36px; display: flex; justify-content: space-between; color: #64748b; font-size: 12px; }
  .sign { border-top: 1px solid #94a3b8; width: 180px; padding-top: 6px; text-align: center; }
`;

export type TermExamCertificateLabels = {
  documentTitle: string;
  certifies: string;
  subject: string;
  exam: string;
  examDate: string;
  score: string;
  grade: string;
  classLabel: string;
  issuedOn: string;
  teacherSignature: string;
};

export type TermExamCertificateInput = {
  schoolName: string;
  studentName: string;
  className: string;
  subject: string;
  examTitle: string;
  examDate?: string;
  score: number;
  maxMarks: number | null;
  teacherName?: string;
  issuedDate: string;
};

export function buildTermExamCertificatePageHtml(
  input: TermExamCertificateInput,
  labels: TermExamCertificateLabels,
): string {
  const percent =
    input.maxMarks != null && input.maxMarks > 0
      ? (input.score / input.maxMarks) * 100
      : input.score;
  const grade = getGrade(percent);
  const scoreText =
    input.maxMarks != null
      ? `${input.score} / ${input.maxMarks}`
      : `${input.score}%`;

  return `<div class="page"><div class="border">
    <div class="school">${escapeHtml(input.schoolName)}</div>
    <div class="title">${escapeHtml(labels.documentTitle)}</div>
    <div class="subtitle">${escapeHtml(labels.certifies)}</div>
    <div class="student">${escapeHtml(input.studentName)}</div>
    <div class="meta">${escapeHtml(labels.classLabel)}: ${escapeHtml(input.className)}</div>
    <table>
      <tr><th>${escapeHtml(labels.subject)}</th><td>${escapeHtml(input.subject)}</td></tr>
      <tr><th>${escapeHtml(labels.exam)}</th><td>${escapeHtml(input.examTitle)}</td></tr>
      <tr><th>${escapeHtml(labels.examDate)}</th><td>${escapeHtml(input.examDate || "—")}</td></tr>
      <tr><th>${escapeHtml(labels.score)}</th><td>${escapeHtml(scoreText)}</td></tr>
      <tr><th>${escapeHtml(labels.grade)}</th><td>${escapeHtml(grade)}</td></tr>
    </table>
    <div class="summary">
      <div class="chip">${escapeHtml(labels.grade)}: ${escapeHtml(grade)}</div>
      <div class="chip">${escapeHtml(labels.score)}: ${escapeHtml(scoreText)}</div>
    </div>
    <div class="footer">
      <div>${escapeHtml(labels.issuedOn)}: ${escapeHtml(input.issuedDate)}</div>
      <div class="sign">${escapeHtml(input.teacherName || labels.teacherSignature)}</div>
    </div>
  </div></div>`;
}

export function buildTermExamCertificateHtml(
  input: TermExamCertificateInput,
  labels: TermExamCertificateLabels,
): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${BASE_STYLES}</style></head><body>${buildTermExamCertificatePageHtml(input, labels)}</body></html>`;
}

export function buildTermExamClassCertificatesHtml(
  certificates: TermExamCertificateInput[],
  labels: TermExamCertificateLabels,
): string {
  const pages = certificates
    .map((cert) => buildTermExamCertificatePageHtml(cert, labels))
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${BASE_STYLES}</style></head><body>${pages}</body></html>`;
}

export type YearlyExamCell = {
  title: string;
  dateLabel?: string;
  scoreLabel: string;
  grade: string;
};

export type YearlySubjectRow = {
  subject: string;
  exams: YearlyExamCell[];
  average: number;
  grade: string;
};

export type YearlyStudentCertificate = {
  studentName: string;
  className: string;
  academicYearLabel: string;
  rows: YearlySubjectRow[];
  overallAverage: number;
  overallGrade: string;
};

export type YearlyCertificateLabels = {
  documentTitle: string;
  academicYear: string;
  student: string;
  classLabel: string;
  subject: string;
  termExams: string;
  average: string;
  grade: string;
  overallAverage: string;
  overallGrade: string;
  issuedOn: string;
  noResults: string;
};

export function buildYearlyStudentCertificateHtml(
  schoolName: string,
  cert: YearlyStudentCertificate,
  labels: YearlyCertificateLabels,
  issuedDate: string,
): string {
  const examHeaders = Array.from(
    { length: Math.max(1, ...cert.rows.map((row) => row.exams.length)) },
    (_, index) => `${labels.termExams} ${index + 1}`,
  );

  const bodyRows =
    cert.rows.length === 0
      ? `<tr><td colspan="${examHeaders.length + 3}">${escapeHtml(labels.noResults)}</td></tr>`
      : cert.rows
          .map((row) => {
            const examCells = examHeaders
              .map((_, index) => {
                const exam = row.exams[index];
                if (!exam) return "<td>—</td>";
                return `<td>${escapeHtml(exam.scoreLabel)} (${escapeHtml(exam.grade)})<br/><span style="color:#64748b;font-size:11px;">${escapeHtml(exam.title)}</span></td>`;
              })
              .join("");
            return `<tr>
              <td>${escapeHtml(row.subject)}</td>
              ${examCells}
              <td>${escapeHtml(String(row.average))}%</td>
              <td>${escapeHtml(row.grade)}</td>
            </tr>`;
          })
          .join("");

  const headerCells = examHeaders
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("");

  return `<div class="page"><div class="border">
    <div class="school">${escapeHtml(schoolName)}</div>
    <div class="title">${escapeHtml(labels.documentTitle)}</div>
    <div class="subtitle">${escapeHtml(labels.academicYear)}: ${escapeHtml(cert.academicYearLabel)}</div>
    <div class="student">${escapeHtml(cert.studentName)}</div>
    <div class="meta">${escapeHtml(labels.classLabel)}: ${escapeHtml(cert.className)}</div>
    <table>
      <thead>
        <tr>
          <th>${escapeHtml(labels.subject)}</th>
          ${headerCells}
          <th>${escapeHtml(labels.average)}</th>
          <th>${escapeHtml(labels.grade)}</th>
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
    <div class="summary">
      <div class="chip">${escapeHtml(labels.overallAverage)}: ${escapeHtml(String(cert.overallAverage))}%</div>
      <div class="chip">${escapeHtml(labels.overallGrade)}: ${escapeHtml(cert.overallGrade)}</div>
    </div>
    <div class="footer">
      <div>${escapeHtml(labels.issuedOn)}: ${escapeHtml(issuedDate)}</div>
    </div>
  </div></div>`;
}

export function buildYearlyClassCertificatesHtml(
  schoolName: string,
  certificates: YearlyStudentCertificate[],
  labels: YearlyCertificateLabels,
  issuedDate: string,
): string {
  const pages = certificates
    .map((cert) =>
      buildYearlyStudentCertificateHtml(schoolName, cert, labels, issuedDate),
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${BASE_STYLES}</style></head><body>${pages}</body></html>`;
}
