import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, getAdditionalUserInfo } from 'firebase/auth';
import { postJson } from './api';
import { firebaseConfig } from '../helpers/config.json';
import type { FormEvent } from 'react';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const userDataUrl = '/Users';

const getUid = () => onAuthStateChanged(auth, (user) => {
  if (user) {
    return user.uid;
  }
  console.warn('no user logged in.');
  return undefined;
});

const loginClickEvent = async (e: FormEvent<HTMLButtonElement>) => {
  e.preventDefault();

  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const additionalInfo = getAdditionalUserInfo(cred);
  const user = additionalInfo?.profile as any;
  if (additionalInfo?.isNewUser) {
    const userObj = {
      FirebaseKey: cred.user.uid,
      FirstName: user?.given_name,
      LastName: user?.family_name,
      Email: user?.email,
    };
    await postJson(`${userDataUrl}`, userObj);
  }
};

const logoutClickEvent = () => {
  window.sessionStorage.removeItem('token');
  signOut(auth);
  window.location.href = '/';
};

export default { getUid, loginClickEvent, logoutClickEvent };
