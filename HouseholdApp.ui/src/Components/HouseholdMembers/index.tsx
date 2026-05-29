import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CustomizedAccordions from '../MaterialAccordion';
import assignments from '../../helpers/data/assignmentData';
import images from '../../helpers/data/imageData';
import week from '../../helpers/data/weekNum';
import Footer from '../Footer';

export default function AddHouseholdMembers({ uid, user, userHousehold }) {
  const queryClient = useQueryClient();

  const userId = React.useMemo(() => {
    const myhouseHold = userHousehold;
    return myhouseHold?.find((uh) => uh.firebaseKey === uid)?.id;
  }, [uid, userHousehold]);

  const { data: assignmentsUsers = [] } = useQuery(
    ['assignmentsUsers', userId],
    () => assignments.getAssignmentsByHouseholdFromUserId(userId),
    {
      enabled: Boolean(userId),
      select: (data) => data.filter((x) => x.week === parseInt(week.thisWeek(), 10)),
    },
  );

  const { data: imageArray = [] } = useQuery(['mainImages'], images.getMainImageByChoreId);

  const completeTask = async (assignment) => {
    const assignObject = {
      id: assignment.assignmentId,
      userId: parseInt(assignment.userId, 10),
      week: assignment.week,
      isCompleted: assignment.isCompleted,
      rating: assignment.rating,
      choreId: assignment.choreId,
    };
    await assignments.setAssignmentAsDone(assignObject);
    queryClient.invalidateQueries(['assignmentsUsers', userId]);
  };

  return (
    <>
      <div>
        <span><h1>Household Chores</h1>
          <span>
          </span>
        </span>
        <CustomizedAccordions images={imageArray} userAssignments={assignmentsUsers} completeTask={completeTask} />
        <Footer />
      </div>
    </>
  );
}
