import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from '../helpers/Routes';
import Nav from '../Components/Nav';
import './App.scss';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useHousehold, useUsersHousehold } from '../data/houseHoldUsers';
import Footer from '../Components/Footer';
import { AuthUser, HouseholdUser } from '../Types';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [uid, setUid] = useState('');
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        currentUser.getIdToken().then((token) => {
          window.sessionStorage.setItem('token', token);
        });
        setUser({ uid: currentUser.uid, displayName: currentUser.displayName ?? '', email: currentUser.email ?? '' });
        setUid(currentUser.uid);
        setAuthed(true);
      } else {
        setUser(null);
        setAuthed(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const { data: userHouseholdData = [] } = useUsersHousehold(uid);
  const { data: householdIdData } = useHousehold(uid);

  const userHousehold = userHouseholdData ?? [];
  const householdId = householdIdData?.householdId ?? 0;

  return (
    <div className='App'>
      <Router>
        <Nav user={user} />
        <Routes
          authed={authed}
          uid={uid}
          user={user}
          householdId={householdId}
          userHousehold={userHousehold}
        />
        <Footer />
      </Router>
    </div>
  );
}

export default App;
