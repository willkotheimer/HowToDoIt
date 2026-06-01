import React from 'react';
import AppModal from '../../Components/AppModal';
import ChoreForm from '../../Components/Forms/ChoreForm';
import AssignmentForm from '../../Components/Forms/AssignmentForm';
import { useAuth } from '../../context/AuthContext';

export default function AssignChoresView() {
  const { uid, userHousehold, householdId } = useAuth();

  return (
    <>
      {userHousehold.length > 0 && <div className="assignChores">
        <h1>Assign the Chores</h1>
        <AppModal key={'addChore'} title={'Add Chore'} buttonLabel={'Add Chore'}>
          <ChoreForm key={'choreform'} uid={uid} />
        </AppModal>
        {userHousehold.map((person, index) => (
          <>
            <div key={`container${index}`}>{person.firstname}</div>
            <AppModal title={'Add Chore'} key={`modal-${index}`} buttonLabel={`${person.firstname}'s Chores`}>
              <AssignmentForm householdId={householdId} key={`assignForm-${person.firstname}`} person={person} uid={uid} />
            </AppModal>
          </>
        ))}
      </div>}
    </>
  );
}
