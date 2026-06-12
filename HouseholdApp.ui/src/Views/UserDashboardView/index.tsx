import React, { useMemo } from 'react';
import logo from '../../styles/images/logo.png';
import week from '../../data/weekNum';
import { useChoresByHousehold, useUnassignedChoresByWeekAndHouseHold } from '../../data/choresData';
import { useAssignmentsByHouseHoldId } from '../../data/assignmentData';
import HouseholdPieChart from '../../Components/HouseholdPieChart';
import AppModal from '../../Components/AppModal';
import ChoreForm from '../../Components/Forms/ChoreForm';
import AssignmentForm from '../../Components/Forms/AssignmentForm';
import AvailableChores from '../../Components/AvailableChores';
import { useAuth } from '../../context/AuthContext';

export default function UserDashboardView() {
  const { user, uid, authed, userHousehold, householdId } = useAuth();

  const { data: unassignedChoresData = [] } = useUnassignedChoresByWeekAndHouseHold(week.thisWeek(), householdId);
  const { data: householdChoresData = [] } = useChoresByHousehold(householdId);
  const { data: assignmentData = [] } = useAssignmentsByHouseHoldId(householdId);

  const filteredWeeklyAssignments = useMemo(
    () => assignmentData.filter((x) => x.week === week.thisWeek()),
    [assignmentData],
  );

  const filteredByNotCompletion = useMemo(
    () => filteredWeeklyAssignments.filter((x) => x.isCompleted !== true),
    [filteredWeeklyAssignments],
  );

  const filteredByCompleted = useMemo(
    () => filteredWeeklyAssignments.filter((x) => x.isCompleted === true),
    [filteredWeeklyAssignments],
  );

  const myId = useMemo(() => userHousehold?.find((uh) => uh.firebaseKey === uid)?.id, [userHousehold, uid]);

  const myAssignments = useMemo(
    () => filteredWeeklyAssignments.filter((mine) => mine.userId === myId),
    [filteredWeeklyAssignments, myId],
  );

  const allMyCompletedAssignments = useMemo(
    () => myAssignments.filter((mycomplete) => mycomplete.isCompleted === true),
    [myAssignments],
  );

  const notCompleted = filteredByNotCompletion.length;
  const allCompleted = filteredByCompleted.length;
  const mycompleted = allMyCompletedAssignments.length;
  const householdChores = householdChoresData.length;
  const unassignedChores = unassignedChoresData.length;

  const housedata = [
    { label: 'Unassigned', value: unassignedChores },
    { label: 'To Do', value: notCompleted },
    { label: 'Complete', value: allCompleted },
  ];

  return (
    <>
      {!!userHousehold && (
        <div className="HouseholdChores">
          {!authed && (
            <div className="sandboxBanner">
              You are in sandbox mode — changes are saved to your browser only and will not affect other users.
            </div>
          )}

          <div className="dashboardLayout">
            {/* Left: stats */}
            <div className="dashboardLeft">
              <div className="Greetings">
                <span className="logo"><img src={logo} alt="Household logo" /></span>
                <div>
                  <h1 className="headline">HOUSEHOLD</h1>
                  <h4 className="mygreeting">Hi {user?.displayName?.split(' ')[0] ?? 'there'}!</h4>
                  <div className="subtitle">Household Stats for Week {week.thisWeek()}</div>
                </div>
              </div>

              <div className="dashboardStats">
                <div className="topContainers">
                  <div>REMAINING TASKS</div>
                  <div><h1>{notCompleted}</h1></div>
                  <div>UNASSIGNED</div>
                  <div><h1>{unassignedChores}</h1></div>
                  <div className="householdPie">
                    <HouseholdPieChart data={housedata} outerRadius={74} innerRadius={20} />
                  </div>
                </div>

                <div className="topContainers">
                  <div>YOUR HOUSEHOLD</div>
                  <ul>
                    {userHousehold?.map((person, index) => (
                      <li key={index}>{person.firstname}</li>
                    ))}
                  </ul>
                </div>

                <div className="topContainers">
                  <div>HOUSEHOLD TASKS</div>
                  <div><h1>{householdChores}</h1></div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="dashboardDivider" />

            {/* Right: assign chores + your tasks */}
            <div className="dashboardRight">
              <h2>Assign the Chores</h2>
              <AppModal key="addChore" title="Add Chore" buttonLabel="Add Chore">
                <ChoreForm key="choreform" uid={uid} />
              </AppModal>
              <div className="assignList">
                {userHousehold.map((person, index) => (
                  <div key={index} className="assignRow">
                    <span>{person.firstname}</span>
                    <AppModal
                      title="Assign Chore"
                      key={`modal-${index}`}
                      buttonLabel={`${person.firstname}'s Chores`}
                    >
                      <AssignmentForm
                        householdId={householdId}
                        key={`assignForm-${person.firstname}`}
                        person={person}
                        uid={uid}
                      />
                    </AppModal>
                  </div>
                ))}
              </div>

              {/* Your Tasks — moved here from the bottom */}
              <div className="yourTasksSidebar">
                <h3>Your Tasks</h3>
                <div className="yourTasksStats">
                  <div className="ytStat">
                    <div className="ytLabel">Remaining</div>
                    <div className="ytValue">{myAssignments.length - mycompleted}</div>
                  </div>
                  <div className="ytStat">
                    <div className="ytLabel">Finished</div>
                    <div className="ytValue">{mycompleted}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Chores rolodex */}
          <AvailableChores />
        </div>
      )}
    </>
  );
}
