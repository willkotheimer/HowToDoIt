import React from 'react';
import { Route, Switch } from 'react-router';
import AssignChores from '../Views/AssignChores';
import ChoresDetailsView from '../Views/ChoreDetails';
import CreateHouseholdView from '../Views/CreateHouseHold';
import SplashPageView from '../Views/SplashPage';
import UserDashboardView from '../Views/UserDashboardView';

export default function Routes({
  user,
  uid,
  userHousehold,
  householdId,
}) {
  return (
        <Switch><>
            { user && <Route exact path='/' component={(props) => <UserDashboardView props={props} user={user} uid={uid} householdId={householdId} userHousehold={userHousehold} />}/> }
            { !user && <Route exact path='/' component={(props) => <SplashPageView props={props} user={user} uid={uid} householdId={householdId} userHousehold={userHousehold} />}/> }
            { user && <Route exact path='/assignchores' component={(props) => <AssignChores props={props} user={user} uid={uid} householdId={householdId} userHousehold={userHousehold} />}/> }
            { user && <Route exact path='/assignmentBoard' component={(props) => <CreateHouseholdView props={props} user={user} uid={uid} userHousehold={userHousehold} />}/> }
            <Route exact path='/chore/:id' component={(props) => <ChoresDetailsView props={props} user={user} />}/>
            </>
        </Switch>
  );
}
