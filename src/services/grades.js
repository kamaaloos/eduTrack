import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export const addGrade = async (studentId, subjectId, score) => {
  await addDoc(collection(db, "grades"), {
    studentId,
    subjectId,
    score,
    date: new Date(),
  });
};

export const getGrades = (studentId, callback) => {
  const q = query(
    collection(db, "grades"),
    where("studentId", "==", studentId)
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  });
};