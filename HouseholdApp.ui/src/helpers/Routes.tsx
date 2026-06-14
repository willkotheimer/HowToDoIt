import React from 'react';
import { Route, Switch } from 'react-router';
import ChoresDetailsView from '../Views/ChoreDetails';
import CreateHouseholdView from '../Views/CreateHouseHold';
import UserDashboardView from '../Views/UserDashboardView';
import ThePlayBook from '../Views/ThePlayBook';
import PlaybookView from '../Views/Playbook';
import ProfileManagementView from '../Views/ProfileManagement';
import HouseholdSettingsView from '../Views/HouseholdSettings';

export default function Routes() {
  return (
    <Switch>
      <Route exact path='/' render={() => <ThePlayBook />} />
      <Route exact path='/dashboard' render={() => <UserDashboardView />} />
      <Route exact path='/assignmentBoard' render={() => <CreateHouseholdView />} />
      <Route exact path='/playbook' render={() => <PlaybookView />} />
      <Route exact path='/profiles' render={() => <ProfileManagementView />} />
      <Route exact path='/settings' render={() => <HouseholdSettingsView />} />
      <Route exact path='/chore/:id' render={(routerProps) => <ChoresDetailsView props={routerProps} />} />
    </Switch>
  );
}
