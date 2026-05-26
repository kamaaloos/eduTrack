export type SchoolFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export type SchoolRecord = {
  id: string;
  name: string;
  active: boolean;
  firebase: SchoolFirebaseConfig;
  logoUrl?: string | null;
  city?: string | null;
};

export type StoredSchool = {
  id: string;
  name: string;
  firebase: SchoolFirebaseConfig;
};
