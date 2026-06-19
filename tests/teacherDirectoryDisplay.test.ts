import {
  formatTeacherClassAssigned,
  formatTeacherSubjects,
} from "../src/utils/teacherDirectoryDisplay";

const classNames = { c1: "Grade 5A", c2: "Grade 6B" };

describe("teacherDirectoryDisplay", () => {
  it("formats assigned classes and subjects for a teacher", () => {
    const subjectLinks = [
      {
        id: "1",
        teacherId: "t1",
        classId: "c1",
        subject: "Math",
        subjectKey: "math",
      },
      {
        id: "2",
        teacherId: "t1",
        classId: "c2",
        subject: "English",
        subjectKey: "english",
      },
    ];
    const classLinks = [{ teacherId: "t1", classId: "c2" }];

    expect(
      formatTeacherClassAssigned("t1", subjectLinks, classLinks, classNames),
    ).toBe("Grade 5A, Grade 6B");
    expect(formatTeacherSubjects("t1", subjectLinks)).toBe("English, Math");
  });

  it("returns em dash when teacher has no assignments", () => {
    expect(formatTeacherClassAssigned("t1", [], [], classNames)).toBe("—");
    expect(formatTeacherSubjects("t1", [])).toBe("—");
  });
});
