import React from 'react';
import { Route, Switch } from 'react-router';
import AssignChores from '../Views/AssignChores';
import ChoresDetailsView from '../Views/ChoreDetails';
import CreateHouseholdView from '../Views/CreateHouseHold';
import SplashPageView from '../Views/SplashPage';
import UserDashboardView from '../Views/UserDashboardView';

export default function Routes({
  authed,
  user,
  uid,
  userHousehold,
  householdId,
}) {
  return (
    <Switch>
      <Route
        exact path='/'
        render={() => authed
          ? <UserDashboardView user={user} uid={uid} householdId={householdId} userHousehold={userHousehold} />
          : <SplashPageView />}
      />
      <Route
        exact path='/assignchores'
        render={() => authed
          ? <AssignChores uid={uid} householdId={householdId} userHousehold={userHousehold} />
          : <SplashPageView />}
      />
      <Route
        exact path='/assignmentBoard'
        render={() => authed
          ? <CreateHouseholdView user={user} uid={uid} userHousehold={userHousehold} />
          : <SplashPageView />}
      />
      <Route
        exact path='/chore/:id'
        render={(routerProps) => <ChoresDetailsView props={routerProps} user={user} />}
      />
    </Switch>
  );
}
