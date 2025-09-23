'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDmkexWvFuzHfFmE2-qw_4FlQ_91Ixz8b4",
  authDomain: "klb-cd-konsult-dev-1.firebaseapp.com",
  projectId: "klb-cd-konsult-dev-1",
  storageBucket: "klb-cd-konsult-dev-1.appspot.com",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
