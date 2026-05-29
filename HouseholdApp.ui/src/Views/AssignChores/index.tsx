import React, { useState, useEffect } from 'react';
import AppModal from '../../Components/AppModal';
import ChoreForm from '../../Components/Forms/ChoreForm';
import AssignmentForm from '../../Components/Forms/AssignmentForm';
import Footer from '../../Components/Footer';

export default function AssignChoresView({ uid, userHousehold, householdId }) {
  return (
    <>
       {userHousehold[0] && <div className="assignChores">
            <h1>Assign the Chores</h1>
            <AppModal key={'addChore'} title={'Add Chore'} buttonLabel={'Add Chore'}>
               <ChoreForm key={'choreform'} uid={uid} />
            </AppModal>
             {userHousehold[0].map((person, index) => (
                <>
                <div key={`container${index}`}>{person.firstname}</div>
                <AppModal title={'Add Chore'} key={`modal-${index}`} buttonLabel={`${person.firstname}'s Chores`}>
                <AssignmentForm userHousehold={userHousehold} householdId={householdId} key={`assignForm-${person.firstname}`} person={person} uid={uid} />
                </AppModal>
                </>
            ))}
            <Footer />
        </div>}
        </>
  );
}
