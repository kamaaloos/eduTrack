import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  ATTENDANCE_ABSENT,
  ATTENDANCE_PRESENT,
  CLASS_A,
  CLASS_B,
  createRulesTestEnv,
  firestoreAs,
  PARENT_REMARK_ABSENCE,
  seedSchoolFixtures,
  UIDS,
} from "./helpers";

describe("Firestore security rules — admin / teacher / parent", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await createRulesTestEnv();
  }, 60_000);

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await seedSchoolFixtures(testEnv);
  }, 30_000);

  describe("admin paths", () => {
    it("allows admin to create user profiles", async () => {
      const db = firestoreAs(testEnv, UIDS.admin);
      await assertSucceeds(
        db.doc("users/new-student").set({
          name: "New Student",
          email: "new-student@test.com",
          role: "student",
        }),
      );
    });

    it("denies teachers from creating user profiles", async () => {
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertFails(
        db.doc("users/new-student").set({
          name: "New Student",
          email: "new-student@test.com",
          role: "student",
        }),
      );
    });

    it("allows admin to read and write teacherClasses", async () => {
      const db = firestoreAs(testEnv, UIDS.admin);
      const docId = `${UIDS.teacher}_${CLASS_B}`;
      await assertSucceeds(
        db.doc(`teacherClasses/${docId}`).set({
          teacherId: UIDS.teacher,
          classId: CLASS_B,
        }),
      );
      await assertSucceeds(db.doc(`teacherClasses/${docId}`).get());
    });

    it("allows admin to read any attendance record", async () => {
      const db = firestoreAs(testEnv, UIDS.admin);
      await assertSucceeds(db.doc(`attendance/${ATTENDANCE_PRESENT}`).get());
    });
  });

  describe("teacher paths", () => {
    it("allows teacher to read own teacherClasses assignment", async () => {
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertSucceeds(
        db.doc(`teacherClasses/${UIDS.teacher}_${CLASS_A}`).get(),
      );
    });

    it("allows teacher to read students in an owned class", async () => {
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertSucceeds(db.doc(`users/${UIDS.student}`).get());
    });

    it("denies teacher from reading students in an unowned class", async () => {
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertFails(db.doc(`users/${UIDS.studentOther}`).get());
    });

    it("allows teacher to create attendance for an owned class", async () => {
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertSucceeds(
        db.doc("attendance/new-attendance").set({
          studentId: UIDS.student,
          classId: CLASS_A,
          date: "2026-06-03",
          status: "present",
        }),
      );
    });

    it("denies teacher from creating attendance for an unowned class", async () => {
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertFails(
        db.doc("attendance/bad-attendance").set({
          studentId: UIDS.studentOther,
          classId: CLASS_B,
          date: "2026-06-03",
          status: "present",
        }),
      );
    });

    it("allows teacher to read parentStudents for a student they teach", async () => {
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertSucceeds(
        db.doc(`parentStudents/${UIDS.parent}_${UIDS.student}`).get(),
      );
    });

    it("allows teacher to read a linked parent user profile", async () => {
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertSucceeds(db.doc(`users/${UIDS.parent}`).get());
    });

    it("allows teacher to read parent absence remarks for their class", async () => {
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertSucceeds(
        db.doc(`parentRemarks/${PARENT_REMARK_ABSENCE}`).get(),
      );
    });

    it("allows teacher to create class-scoped homework", async () => {
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertSucceeds(
        db.doc(`classes/${CLASS_A}/homework/hw2`).set({
          classId: CLASS_A,
          title: "Science reading",
        }),
      );
    });

    it("denies teacher from updating parentResponse on attendance", async () => {
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertFails(
        db.doc(`attendance/${ATTENDANCE_ABSENT}`).update({
          parentResponse: {
            parentId: UIDS.parent,
            reasonCode: "sick",
            reason: "Blocked by rules",
          },
        }),
      );
    });
  });

  describe("parent paths", () => {
    it("allows parent to query parentStudents by parentId", async () => {
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertSucceeds(
        db
          .collection("parentStudents")
          .where("parentId", "==", UIDS.parent)
          .get(),
      );
    });

    it("allows parent to read a linked student profile", async () => {
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertSucceeds(db.doc(`users/${UIDS.student}`).get());
    });

    it("denies parent from reading an unrelated student profile", async () => {
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertFails(db.doc(`users/${UIDS.studentOther}`).get());
    });

    it("allows parent to read attendance for a linked child", async () => {
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertSucceeds(
        db.doc(`attendance/${ATTENDANCE_PRESENT}`).get(),
      );
    });

    it("allows parent to respond to absent attendance once", async () => {
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertSucceeds(
        db.doc(`attendance/${ATTENDANCE_ABSENT}`).update({
          parentResponse: {
            parentId: UIDS.parent,
            reasonCode: "sick",
            reason: "Flu",
          },
        }),
      );
    });

    it("denies parent from changing attendance status", async () => {
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertFails(
        db.doc(`attendance/${ATTENDANCE_ABSENT}`).update({
          status: "present",
        }),
      );
    });

    it("allows parent to create an absence parentRemark", async () => {
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertSucceeds(
        db.doc("parentRemarks/new-absence").set({
          parentId: UIDS.parent,
          studentId: UIDS.student,
          classId: CLASS_A,
          type: "absence",
          reason: "Family travel",
        }),
      );
    });

    it("allows parent to read parentClassAccess", async () => {
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertSucceeds(
        db.doc(`parentClassAccess/${UIDS.parent}_${CLASS_A}`).get(),
      );
    });

    it("allows parent to read class homework via parentClassAccess", async () => {
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertSucceeds(
        db.doc(`classes/${CLASS_A}/homework/hw1`).get(),
      );
    });

    it("denies parent from writing teacherClasses", async () => {
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertFails(
        db.doc(`teacherClasses/${UIDS.parent}_${CLASS_A}`).set({
          teacherId: UIDS.parent,
          classId: CLASS_A,
        }),
      );
    });
  });

  describe("parent paths — legacy parentStudents link", () => {
    beforeEach(async () => {
      await testEnv.clearFirestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.doc(`users/${UIDS.parent}`).set({
          name: "Parent One",
          email: "parent@test.com",
          role: "parent",
        });
        await db.doc(`users/${UIDS.student}`).set({
          name: "Student One",
          email: "student@test.com",
          role: "student",
          classId: CLASS_A,
        });
        await db.doc(`classes/${CLASS_A}`).set({ name: "Class A" });
        await db.doc(`parentStudents/${UIDS.parent}`).set({
          studentId: UIDS.student,
        });
      });
    }, 30_000);

    it("allows parent to read legacy link doc without parentId field", async () => {
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertSucceeds(db.doc(`parentStudents/${UIDS.parent}`).get());
    });

    it("allows parent to read student profile via legacy link", async () => {
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertSucceeds(db.doc(`users/${UIDS.student}`).get());
    });
  });

  describe("subscription gate", () => {
    beforeEach(async () => {
      await testEnv.clearFirestore();
    }, 30_000);

    it("allows school data when platform/subscription is missing (legacy)", async () => {
      await seedSchoolFixtures(testEnv);
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertSucceeds(db.doc(`users/${UIDS.student}`).get());
    });

    it("allows school data when entitled is true", async () => {
      await seedSchoolFixtures(testEnv, { subscriptionEntitled: true });
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertSucceeds(db.doc(`users/${UIDS.student}`).get());
    });

    it("blocks school data when entitled is false", async () => {
      await seedSchoolFixtures(testEnv, { subscriptionEntitled: false });
      const db = firestoreAs(testEnv, UIDS.teacher);
      await assertFails(db.doc(`users/${UIDS.student}`).get());
    });

    it("allows signed-in users to read platform/subscription but not write", async () => {
      await seedSchoolFixtures(testEnv, { subscriptionEntitled: true });
      const db = firestoreAs(testEnv, UIDS.parent);
      await assertSucceeds(db.doc("platform/subscription").get());
      await assertFails(
        db.doc("platform/subscription").set({ entitled: true }),
      );
    });

    it("allows admin to write platform/schoolTerm", async () => {
      await seedSchoolFixtures(testEnv, { subscriptionEntitled: true });
      const adminDb = firestoreAs(testEnv, UIDS.admin);
      await assertSucceeds(
        adminDb.doc("platform/schoolTerm").set({
          status: "active",
          label: "2025-2026",
          startedAt: "2025-08-01T00:00:00.000Z",
          startedBy: UIDS.admin,
        }),
      );
      const teacherDb = firestoreAs(testEnv, UIDS.teacher);
      await assertFails(
        teacherDb.doc("platform/schoolTerm").set({
          status: "active",
          label: "2025-2026",
          startedAt: "2025-08-01T00:00:00.000Z",
          startedBy: UIDS.teacher,
        }),
      );
    });

    it("allows super admin to list schoolRegistry even when subscription entitled is false", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.doc(`users/${UIDS.superAdmin}`).set({
          role: "superAdmin",
          email: "super@test.com",
          name: "Super Admin",
        });
        await db.doc("schoolRegistry/school-1").set({
          name: "Test School",
          active: false,
          firebase: { projectId: "demo-school" },
        });
        await db.doc("platform/subscription").set({ entitled: false });
      });

      const superDb = firestoreAs(testEnv, UIDS.superAdmin);
      await assertSucceeds(superDb.collection("schoolRegistry").get());
    });
  });

  describe("secretary paths", () => {
    it("allows secretary to list and read parent users", async () => {
      const db = firestoreAs(testEnv, UIDS.secretary);
      await assertSucceeds(
        db.collection("users").where("role", "==", "parent").get(),
      );
      await assertSucceeds(db.doc(`users/${UIDS.parent}`).get());
    });

    it("denies secretary from reading admin users", async () => {
      const db = firestoreAs(testEnv, UIDS.secretary);
      await assertFails(db.doc(`users/${UIDS.admin}`).get());
    });

    it("allows secretary to read linked students and parentStudents", async () => {
      const db = firestoreAs(testEnv, UIDS.secretary);
      await assertSucceeds(db.doc(`users/${UIDS.student}`).get());
      await assertSucceeds(
        db.doc(`parentStudents/${UIDS.parent}_${UIDS.student}`).get(),
      );
    });

    it("allows secretary to update parent fee fields only", async () => {
      const db = firestoreAs(testEnv, UIDS.secretary);
      await assertSucceeds(
        db.doc(`users/${UIDS.parent}`).update({
          feePaid: true,
          feeMonths: { "2026-07": true },
        }),
      );
    });

    it("denies secretary from creating users", async () => {
      const db = firestoreAs(testEnv, UIDS.secretary);
      await assertFails(
        db.doc("users/new-parent").set({
          name: "New Parent",
          email: "new-parent@test.com",
          role: "parent",
        }),
      );
    });

    it("denies secretary from updating non-fee parent fields", async () => {
      const db = firestoreAs(testEnv, UIDS.secretary);
      await assertFails(
        db.doc(`users/${UIDS.parent}`).update({
          name: "Changed Name",
        }),
      );
    });
  });
});
