import React, { useMemo } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { Formik, Form as FormikForm } from 'formik';
import {
  Card, CardBody, CardHeader, Button,
} from 'reactstrap';
import { useUnassignedChoresByWeekAndHouseHold } from '../../helpers/data/choresData';
import { useAssignmentsByHouseholdFromUserId, useCreateAssignment } from '../../helpers/data/assignmentData';
import Week from '../../helpers/data/weekNum';
import { Assignment, Chore } from '../../Types';

interface AssignmentFormProps {
  person: { id: number; firstname: string; name?: string };
  householdId: number;
  uid: string;
  toggle: () => void;
}

interface OptionType {
  value: number;
  label: string;
}

interface AssignmentFormValues {
  selected: OptionType[];
}

export default function AssignmentForm({ person, householdId, toggle }: AssignmentFormProps) {
  const { data: assignments = [] } = useAssignmentsByHouseholdFromUserId(person.id);
  const { data: unassigned = [] } = useUnassignedChoresByWeekAndHouseHold(Week.thisWeek(), householdId);
  const createAssignmentMutation = useCreateAssignment();

  const useSelection = useMemo(() => unassigned.map((op) => ({ value: op.id ?? 0, label: op.name ?? '' })), [unassigned]);

  const filteredByThisWeek = useMemo(() => assignments.filter((a) => a.week === Week.thisWeek()), [assignments]);
  const myAssignments = useMemo(() => filteredByThisWeek.filter((a) => a.userId === person.id), [filteredByThisWeek, person.id]);

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
