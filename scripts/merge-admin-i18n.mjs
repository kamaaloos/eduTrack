/**
 * Merges admin component i18n keys into all locale files.
 * Run: node scripts/merge-admin-i18n.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "..", "src", "i18n", "locales");

const commonKeys = {
  en: {
    saved: "Saved",
    send: "Send",
    clear: "Clear",
    rename: "Rename",
    assign: "Assign",
    errorBoundaryTitle: "Something went wrong",
    errorBoundaryMessage: "An unexpected error occurred",
    errorBoundaryUnexpected: "An unexpected error occurred",
  },
  so: {
    saved: "Waa la kaydiyay",
    send: "Dir",
    clear: "Nadiifi",
    rename: "Magac beddel",
    assign: "Xilsaar",
    errorBoundaryTitle: "Wax baa khaldamay",
    errorBoundaryMessage: "Khalad lama filayn ayaa dhacay",
    errorBoundaryUnexpected: "Khalad lama filayn ayaa dhacay",
  },
  ar: {
    saved: "تم الحفظ",
    send: "إرسال",
    clear: "مسح",
    rename: "إعادة تسمية",
    assign: "تعيين",
    errorBoundaryTitle: "حدث خطأ ما",
    errorBoundaryMessage: "حدث خطأ غير متوقع",
    errorBoundaryUnexpected: "حدث خطأ غير متوقع",
  },
  fi: {
    saved: "Tallennettu",
    send: "Lähetä",
    clear: "Tyhjennä",
    rename: "Nimeä uudelleen",
    assign: "Määritä",
    errorBoundaryTitle: "Jokin meni pieleen",
    errorBoundaryMessage: "Odottamaton virhe tapahtui",
    errorBoundaryUnexpected: "Odottamaton virhe tapahtui",
  },
};

const adminKeys = {
  en: {
    userCreatedSuccess: "{{role}} account created",
    createUserFailed: "Failed to create user",
    selectRole: "Select role",
    fullNamePlaceholder: "Full name",
    passwordMinPlaceholder: "Password (min 6 characters)",
    classCreated: "Class created",
    createClassFailed: "Failed to create class",
    classNamePlaceholder: "Class name (e.g. Grade 10 A)",
    classUpdated: "Class updated.",
    couldNotSave: "Could not save",
    deleteClassTitle: "Delete class",
    deleteClassMessage:
      'Delete "{{name}}"? Student and teacher links for this class will be removed. Class data (homework, exams) may remain in storage.',
    classRemoved: "Class removed.",
    couldNotDelete: "Could not delete",
    searchClasses: "Search classes…",
    noClassesFound: "No classes found.",
    renameClass: "Rename class",
    classNameField: "Class name",
    subjectsCount: "{{count}} subject",
    subjectsCount_plural: "{{count}} subjects",
    searchUsers: "Search by name or email…",
    noUsersFound: "No {{role}}s found.",
    noUsersForSearch: "No {{role}}s found for this search.",
    profileUpdated: "Profile updated.",
    noEmail: "No email",
    noEmailOnFile: "This user has no email on file.",
    resetPasswordTitle: "Reset password",
    resetPasswordMessage: "Send a password reset link to {{email}}?",
    sendEmail: "Send email",
    emailSent: "Email sent",
    resetPasswordHint:
      "The user can set a new password from the link in their inbox.",
    editUser: "Edit user",
    fullNameLabel: "Full name",
    emailProfileLabel: "Email (profile)",
    passwordResetNote:
      "Password reset sends an email link. Login email in Firebase may still match the original address until reset is completed.",
    removeUserTitle: "Remove {{role}}",
    removeUserMessage:
      "Remove {{name}}? Their assignments and links will be cleared. They will no longer appear in the app.",
    userRemoved: "{{role}} removed from the directory.",
    couldNotRemove: "Could not remove",
    resetPasswordAction: "Reset password",
    classIdLabel: "Class ID: {{id}}",
    broadcastMissingFields: "Enter a title and message.",
    broadcastNoClasses: "Create at least one class before broadcasting.",
    broadcastConfirmTitle: "Send to all classes?",
    broadcastConfirmMessage:
      "This announcement will be posted to all {{count}} class(es). Students see announcements for their assigned class.",
    announcementSent: "Announcement sent",
    announcementSentDetail:
      "Published to {{published}} of {{total}} classes.{{errors}}",
    broadcastErrors: "\n\nErrors:\n{{errors}}",
    sendToAllClasses: "Send to all classes ({{count}})",
    messagePlaceholder: "Message",
    broadcastHint:
      'Sends the same announcement to every class ({{count}} total). Each class gets its own copy under classes/{classId}/announcements.',
    excelConfirmTitle: "Confirm import",
    excelConfirmWorkbook:
      "Import all recognized sheets in order (classes → users → assignments → academic data)?",
    excelConfirmSheet: 'Import "{{kind}}" sheet into Firestore?',
    importCompleted: "Import completed",
    importNoRows: "No rows imported.",
    importFailed: "Import failed",
    couldNotDownloadTemplate: "Could not download template",
    couldNotReadFile: "Could not read file",
    excelHint:
      "Use one .xlsx workbook with named sheets, or a single sheet for one data type. First row must be column headers. Import classes and users before assignments and academic data.",
    fullWorkbook: "Full workbook",
    singleSheet: "Single sheet",
    downloadFullTemplate: "Download full template (.xlsx)",
    downloadSheetTemplate: "Download {{kind}} template (.xlsx)",
    chooseExcelFile: "Choose Excel file (.xlsx)",
    fileLabel: "File: {{name}}",
    noImportableRows:
      "File opened but no importable rows were detected. Check sheet tab names and column headers, or use the template.",
    unrecognizedSheets: "Unrecognized sheets (skipped): {{sheets}}",
    runImport: "Run import",
    importSummary: "{{kind}}: {{created}} created, {{skipped}} skipped",
    importMoreErrors: "\n+{{count}} more",
    sheetRowPreview: "{{preview}}",
    selectBothFields: "Please select both {{left}} and {{right}}",
    studentAssigned: "Student assigned to class",
    teacherAssigned: "Teacher assigned to class",
    parentLinked: "Parent linked to student",
    selectClassFirst: "Choose a class first.",
    duplicateSubject: "Duplicate",
    subjectAlreadyInList: "This subject is already in the list.",
    classSubjectsTitle: "Class subjects",
    classSubjectsHint:
      "Each class offers subjects such as Math, English, Quran, Geography. Tap Add to save each subject to the class, then assign teachers below.",
    subjectNamePlaceholder: "Subject name (e.g. Math)",
    noSubjectsForClass: "No subjects yet for this class.",
    saveSubjects: "Save subjects",
    classSubjectsUpdated: "Class subjects updated.",
    couldNotSaveSubjects: "Could not save subjects",
    scheduleLoadFailed: "Could not load schedule",
    fillTimeAndSubject: "Fill in time range and subject",
    deleteSlotTitle: "Delete slot?",
    scheduleSavedTitle: "Saved to Firestore",
    scheduleSavedPath: "Path: classes/{{classId}}/schedules/{{docId}}",
    scheduleSavedDay: "Day: {{day}}",
    scheduleVisibleToday: "Students see this on their dashboard today.",
    scheduleVisibleOtherDay:
      "Students only see this on {{day}}. Today is {{today}} — switch the Day chip to add today's schedule.",
    couldNotSaveSlot: "Could not save slot",
    deleteFailed: "Delete failed",
    classScheduleTitle: "Class schedule",
    classScheduleHint:
      "Saved under Firestore: classes → (pick class) → schedules → (auto id). Not the old top-level timetables collection.",
    todayIsBanner:
      "Today is {{day}} — select that day so students see periods on their dashboard now.",
    createClassFirst: "Create a class first.",
    dayLabel: "Day",
    useToday: "Use today ({{short}})",
    addPeriod: "Add period",
    startLabel: "Start",
    endLabel: "End",
    scheduleSubjectPlaceholder: "Subject (e.g. Math)",
    teacherNamePlaceholder: "Teacher name (e.g. Mohammed → Moh)",
    addToSchedule: "Add to schedule",
    periodsForDay: "{{day}} ({{count}})",
    noPeriodsForDay: "No periods for this day yet.",
    teacherSubjectTitle: "Assign teacher to subject",
    teacherSubjectHint:
      "A teacher must be assigned to at least one class and one subject (e.g. 5A → Math). They can teach multiple subjects and classes.",
    addSubjectsFirst:
      "Add subjects to this class in the section above first.",
    teacherSubjectAssigned: "Teacher assigned to subject.",
    assignmentFailed: "Assignment failed",
    removeAssignmentTitle: "Remove assignment",
    removeAssignmentMessage:
      "Remove {{teacher}} from {{subject}}?",
    currentAssignments: "Current assignments",
    noTeacherSubjectAssignments: "No teacher–subject assignments yet.",
    selectorNoAvailable: "No {{title}} available",
    selectorSelect: "Select {{title}}",
    selectorSearch: "Search…",
    selectorNoMatches: "No matches found",
    directoryShowing: "Showing {{start}}–{{end}} of {{total}}",
    directoryPrevious: "Previous",
    directoryNext: "Next",
    defaultPassword: "123456",
  },
};

// Somali, Arabic, Finnish: use English as base then override key phrases (abbreviated for maintainability)
adminKeys.so = { ...adminKeys.en, ...{
  userCreatedSuccess: "Akoonka {{role}} waa la abuuray",
  selectRole: "Dooro doorka",
  fullNamePlaceholder: "Magaca buuxa",
  classCreated: "Fasalka waa la abuuray",
  searchClasses: "Raadi fasallada…",
  noClassesFound: "Fasallo lama helin.",
  searchUsers: "Raadi magac ama iimayl…",
  broadcastHint: "Ogeysiis isku mid ah ayaa loo dirayaa dhammaan fasallada ({{count}}).",
  excelHint: "Isticmaal workbook .xlsx hal mar ama hal sheet nooc xog ah.",
  runImport: "Soco gelinta",
  classSubjectsTitle: "Maadooyinka fasalka",
  classScheduleTitle: "Jadwalka fasalka",
  teacherSubjectTitle: "U xilsaar macallin maadada",
}};
adminKeys.ar = { ...adminKeys.en, ...{
  userCreatedSuccess: "تم إنشاء حساب {{role}}",
  selectRole: "اختر الدور",
  fullNamePlaceholder: "الاسم الكامل",
  classCreated: "تم إنشاء الصف",
  searchClasses: "بحث في الصفوف…",
  noClassesFound: "لم يُعثر على صفوف.",
  searchUsers: "بحث بالاسم أو البريد…",
  runImport: "تشغيل الاستيراد",
  classSubjectsTitle: "مواد الصف",
  classScheduleTitle: "جدول الصف",
  teacherSubjectTitle: "تعيين معلم للمادة",
}};
adminKeys.fi = { ...adminKeys.en, ...{
  userCreatedSuccess: "{{role}}-tili luotu",
  selectRole: "Valitse rooli",
  fullNamePlaceholder: "Koko nimi",
  classCreated: "Luokka luotu",
  searchClasses: "Hae luokkia…",
  noClassesFound: "Luokkia ei löytynyt.",
  searchUsers: "Hae nimellä tai sähköpostilla…",
  runImport: "Suorita tuonti",
  classSubjectsTitle: "Luokan aineet",
  classScheduleTitle: "Luokan aikataulu",
  teacherSubjectTitle: "Määritä opettaja aineeseen",
}};

for (const lang of ["en", "so", "ar", "fi"]) {
  const file = path.join(localesDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  Object.assign(data.common, commonKeys[lang]);
  Object.assign(data.admin, adminKeys[lang]);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Updated ${lang}.json`);
}
