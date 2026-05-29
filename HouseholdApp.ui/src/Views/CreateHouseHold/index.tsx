import React from 'react';
import AddHouseholdMembers from '../../Components/HouseholdMembers';

export default function CreateHouseholdView({ user, uid, userHousehold }) {
  return (
        <div className="createHousehold">
            <AddHouseholdMembers user={user} uid={uid} userHousehold={userHousehold[0]} />
        </div>
  );
}
