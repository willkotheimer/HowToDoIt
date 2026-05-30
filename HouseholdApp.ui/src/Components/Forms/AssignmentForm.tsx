import React, { useMemo } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { Formik, Form as FormikForm } from 'formik';
import {
  Card, CardBody, CardHeader, Button,
} from 'reactstrap';
import { useUnassignedChoresByWeekAndHouseHold } from '../../data/choresData';
import { useAssignmentsByHouseholdFromUserId, useCreateAssignment } from '../../data/assignmentData';
import Week from '../../data/weekNum';
import { choresToSelectOptions, filterAssignmentsByWeek, filterAssignmentsByUser, ChoreSelectOption } from '../../helpers/FormsHelper';

interface AssignmentFormProps {
  person: { id: number; firstname: string; name?: string };
  householdId: number;
  uid: string;
  toggle?: () => void;
}

interface AssignmentFormValues {
  selected: ChoreSelectOption[];
}

export default function AssignmentForm({ person, householdId, toggle }: AssignmentFormProps) {
  const { data: assignments = [] } = useAssignmentsByHouseholdFromUserId(person.id);
  const { data: unassigned = [] } = useUnassignedChoresByWeekAndHouseHold(Week.thisWeek(), householdId);
  const createAssignmentMutation = useCreateAssignment();

  const useSelection = useMemo(() => choresToSelectOptions(unassigned), [unassigned]);

  const filteredByThisWeek = useMemo(() => filterAssignmentsByWeek(assignments, Week.thisWeek()), [assignments]);
  const myAssignments = useMemo(() => filterAssignmentsByUser(filteredByThisWeek, person.id), [filteredByThisWeek, person.id]);

  return (
    <Card className='assignment-form'>
      <CardHeader>{person.firstname} Chores for Week {Week.thisWeek()}</CardHeader>
      <CardBody>
        <Formik
          initialValues={{ selected: [] }}
          onSubmit={(values) => {
            values.selected.forEach((item) => {
              createAssignmentMutation.mutate({
                userId: person.id,
                week: Week.thisWeek(),
                isCompleted: false,
                rating: 0,
                choreId: item.value,
              });
            });
            toggle();
          }}
        >
          {({ values, setFieldValue }) => (
            <FormikForm style={{ width: '75%' }}>
              <Select
                name='selected'
                className='assignForm'
                components={makeAnimated()}
                options={useSelection}
                onChange={(value) => setFieldValue('selected', value)}
                value={values.selected}
                isMulti
              />
              <br />
              <Button type='submit' className='mt-3'>Submit</Button>
            </FormikForm>
          )}
        </Formik>
        <div className='assigntitle'>Assigned to this user:</div>
        <div className='myAssignedContainer'>
          {myAssignments.map((assignmentItem, index) => (
            <span key={`AllMine-${assignmentItem.chorename}-${index}`} className='assignedtome'>
              {assignmentItem.chorename}
            </span>
          ))}
        </div>
        <div className='assigntitle'>Unassigned Tasks:</div>
        <div className='unassignedContainer'>
          {unassigned.map((chore, index) => (
            <span key={`Nonassigned-${index}-${chore.id}`} className='assignedtonoone'>
              {chore.name}
            </span>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
