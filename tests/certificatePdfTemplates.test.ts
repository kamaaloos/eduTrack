import {
  buildTermExamCertificateHtml,
  buildTermExamClassCertificatesHtml,
  buildYearlyClassCertificatesHtml,
} from "../src/services/certificatePdfTemplates";

const termLabels = {
  documentTitle: "Term exam certificate",
  certifies: "Certifies",
  subject: "Subject",
  exam: "Exam",
  examDate: "Exam date",
  score: "Score",
  grade: "Grade",
  classLabel: "Class",
  issuedOn: "Issued on",
  teacherSignature: "Teacher",
};

const yearlyLabels = {
  documentTitle: "Yearly results",
  academicYear: "Academic year",
  student: "Student",
  classLabel: "Class",
  subject: "Subject",
  termExams: "Term exam",
  average: "Average",
  grade: "Grade",
  overallAverage: "Overall average",
  overallGrade: "Overall grade",
  issuedOn: "Issued on",
  noResults: "No results",
};

describe("certificate PDF templates", () => {
  it("builds term exam certificate html", () => {
    const html = buildTermExamCertificateHtml(
      {
        schoolName: "Demo School",
        studentName: "Jane Doe",
        className: "Grade 10A",
        subject: "Math",
        examTitle: "Mid-term",
        examDate: "2026-03-01",
        score: 42,
        maxMarks: 50,
        issuedDate: "2026-05-28",
      },
      termLabels,
    );

    expect(html).toContain("Demo School");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("42 / 50");
  });

  it("builds multi-student term exam certificate html", () => {
    const html = buildTermExamClassCertificatesHtml(
      [
        {
          schoolName: "Demo School",
          studentName: "Jane Doe",
          className: "Grade 10A",
          subject: "Math",
          examTitle: "Mid-term",
          examDate: "2026-03-01",
          score: 42,
          maxMarks: 50,
          issuedDate: "2026-05-28",
        },
        {
          schoolName: "Demo School",
          studentName: "John Smith",
          className: "Grade 10A",
          subject: "Math",
          examTitle: "Mid-term",
          examDate: "2026-03-01",
          score: 38,
          maxMarks: 50,
          issuedDate: "2026-05-28",
        },
      ],
      termLabels,
    );

    expect(html).toContain("Jane Doe");
    expect(html).toContain("John Smith");
    expect(html.match(/class="page"/g)?.length).toBe(2);
  });

  it("builds yearly class certificate html", () => {
    const html = buildYearlyClassCertificatesHtml(
      "Demo School",
      [
        {
          studentName: "Jane Doe",
          className: "Grade 10A",
          academicYearLabel: "2025-2026",
          rows: [
            {
              subject: "Math",
              exams: [
                {
                  title: "Mid-term",
                  scoreLabel: "42/50",
                  grade: "B",
                },
              ],
              average: 84,
              grade: "B",
            },
          ],
          overallAverage: 84,
          overallGrade: "B",
        },
      ],
      yearlyLabels,
      "2026-05-28",
    );

    expect(html).toContain("Jane Doe");
    expect(html).toContain("Math");
    expect(html).toContain("2025-2026");
  });
});
