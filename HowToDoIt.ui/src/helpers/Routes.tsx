import React from 'react';
import { Route, Switch } from 'react-router';
import Feed from '../Views/Feed';
import SequenceDetail from '../Views/SequenceDetail';
import SequenceEditor from '../Views/SequenceEditor';

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/" component={Feed} />
      <Route exact path="/create" component={SequenceEditor} />
      <Route exact path="/sequence/:id/edit" component={SequenceEditor} />
      <Route exact path="/sequence/:id" component={SequenceDetail} />
    </Switch>
  );
}
