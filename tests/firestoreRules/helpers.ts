import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { join } from "path";

/** Must match `--project` in npm run test:rules (demo-* recommended by Firebase). */
export const PROJECT_ID =
  process.env.GCLOUD_PROJECT ?? "demo-edutrack-rules-test";

export const UIDS = {
  admin: "admin1",
  superAdmin: "superadmin1",
  teacher: "teacher1",
  teacherOther: "teacher2",
  parent: "parent1",
  secretary: "secretary1",
  student: "student1",
  studentOther: "student2",
} as const;

export const CLASS_A = "class-a";
export const CLASS_B = "class-b";

export const ATTENDANCE_PRESENT = "att-present-1";
export const ATTENDANCE_ABSENT = "att-absent-1";
export const PARENT_REMARK_ABSENCE = "parent-remark-absence-1";

export async function createRulesTestEnv(): Promise<RulesTestEnvironment> {
  const rulesPath = join(__dirname, "../../firestore.rules");
  return initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(rulesPath, "utf8"),
    },
  });
}

/** Seed users, relations, and sample docs used across role-path tests. */
export async function seedSchoolFixtures(
  testEnv: RulesTestEnvironment,
  options?: { subscriptionEntitled?: boolean },
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const { admin, teacher, teacherOther, parent, secretary, student, studentOther } =
      UIDS;

    await db.doc(`users/${admin}`).set({
      name: "Admin User",
      email: "admin@test.com",
      role: "admin",
    });
    await db.doc(`users/${teacher}`).set({
      name: "Teacher One",
      email: "teacher@test.com",
      role: "teacher",
    });
    await db.doc(`users/${teacherOther}`).set({
      name: "Teacher Two",
      email: "teacher2@test.com",
      role: "teacher",
    });
    await db.doc(`users/${student}`).set({
      name: "Student One",
      email: "student@test.com",
      role: "student",
      classId: CLASS_A,
    });
    await db.doc(`users/${studentOther}`).set({
      name: "Student Two",
      email: "student2@test.com",
      role: "student",
      classId: CLASS_B,
    });
    await db.doc(`users/${parent}`).set({
      name: "Parent One",
      email: "parent@test.com",
      role: "parent",
      linkedStudentIds: [student],
      feePaid: false,
      feeMonths: {},
    });
    await db.doc(`users/${secretary}`).set({
      name: "Secretary One",
      email: "secretary@test.com",
      role: "secretary",
    });

    await db.doc(`classes/${CLASS_A}`).set({ name: "Class A" });
    await db.doc(`classes/${CLASS_B}`).set({ name: "Class B" });

    await db.doc(`teacherClasses/${teacher}_${CLASS_A}`).set({
      teacherId: teacher,
      classId: CLASS_A,
    });
    await db.doc(`teacherClasses/${teacherOther}_${CLASS_B}`).set({
      teacherId: teacherOther,
      classId: CLASS_B,
    });

    await db.doc(`studentClasses/${student}_${CLASS_A}`).set({
      studentId: student,
      classId: CLASS_A,
    });
    await db.doc(`studentClasses/${studentOther}_${CLASS_B}`).set({
      studentId: studentOther,
      classId: CLASS_B,
    });

    await db.doc(`parentStudents/${parent}_${student}`).set({
      parentId: parent,
      studentId: student,
    });
    await db.doc(`parentClassAccess/${parent}_${CLASS_A}`).set({
      parentId: parent,
      studentId: student,
      classId: CLASS_A,
    });

    await db.doc(`attendance/${ATTENDANCE_PRESENT}`).set({
      studentId: student,
      classId: CLASS_A,
      date: "2026-06-01",
      status: "present",
    });
    await db.doc(`attendance/${ATTENDANCE_ABSENT}`).set({
      studentId: student,
      classId: CLASS_A,
      date: "2026-06-02",
      status: "absent",
    });

    await db.doc(`parentRemarks/${PARENT_REMARK_ABSENCE}`).set({
      parentId: parent,
      studentId: student,
      classId: CLASS_A,
      type: "absence",
      reason: "Doctor appointment",
    });

    await db.doc(`classes/${CLASS_A}/homework/hw1`).set({
      classId: CLASS_A,
      title: "Math worksheet",
    });

    if (options?.subscriptionEntitled !== undefined) {
      await db.doc("platform/subscription").set({
        entitled: options.subscriptionEntitled,
      });
    }
  });
}

export function firestoreAs(testEnv: RulesTestEnvironment, uid: string) {
  return testEnv.authenticatedContext(uid).firestore();
}
