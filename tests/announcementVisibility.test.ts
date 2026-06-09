import {
  filterAnnouncementsForViewer,
  isAnnouncementVisibleToViewer,
} from "../src/utils/announcementVisibility";

describe("announcementVisibility", () => {
  const classWide = { direct: false, title: "All" };
  const toStudent = {
    direct: true,
    targetRole: "student",
    targetUserId: "student-1",
    studentId: "student-1",
  };
  const toParent = {
    direct: true,
    targetRole: "parent",
    targetUserId: "parent-1",
    studentId: "student-1",
  };

  it("shows class-wide announcements to everyone", () => {
    expect(
      isAnnouncementVisibleToViewer(classWide, {
        userId: "student-1",
        role: "student",
      }),
    ).toBe(true);
    expect(
      isAnnouncementVisibleToViewer(classWide, {
        userId: "parent-1",
        role: "parent",
        studentId: "student-1",
      }),
    ).toBe(true);
  });

  it("shows direct student messages only to that student", () => {
    expect(
      isAnnouncementVisibleToViewer(toStudent, {
        userId: "student-1",
        role: "student",
      }),
    ).toBe(true);
    expect(
      isAnnouncementVisibleToViewer(toStudent, {
        userId: "student-2",
        role: "student",
      }),
    ).toBe(false);
    expect(
      isAnnouncementVisibleToViewer(toStudent, {
        userId: "parent-1",
        role: "parent",
        studentId: "student-1",
      }),
    ).toBe(false);
  });

  it("shows direct parent messages only to that parent for the child", () => {
    expect(
      isAnnouncementVisibleToViewer(toParent, {
        userId: "parent-1",
        role: "parent",
        studentId: "student-1",
      }),
    ).toBe(true);
    expect(
      isAnnouncementVisibleToViewer(toParent, {
        userId: "parent-2",
        role: "parent",
        studentId: "student-1",
      }),
    ).toBe(false);
    expect(
      isAnnouncementVisibleToViewer(toParent, {
        userId: "parent-1",
        role: "parent",
        studentId: "student-2",
      }),
    ).toBe(false);
  });

  it("filters a mixed list for a student viewer", () => {
    const filtered = filterAnnouncementsForViewer(
      [classWide, toStudent, toParent],
      { userId: "student-1", role: "student", studentId: "student-1" },
    );
    expect(filtered).toEqual([classWide, toStudent]);
  });
});
