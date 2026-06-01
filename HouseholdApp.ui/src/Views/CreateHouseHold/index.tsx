import React from 'react';
import AddHouseholdMembers from '../../Components/HouseholdMembers';
import { useAuth } from '../../context/AuthContext';

export default function CreateHouseholdView() {
  const { user, uid, userHousehold } = useAuth();

  return (
    <div className="createHousehold">
      <AddHouseholdMembers user={user} uid={uid} userHousehold={userHousehold} />
    </div>
  );
}
