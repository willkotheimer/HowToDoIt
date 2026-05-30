import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Chores from '../../data/choresData';
import logo from '../../styles/images/logo.png';
import Footer from '../../Components/Footer';
import week from '../../data/weekNum';
import assignments from '../../data/assignmentData';
import HouseholdPieChart from '../../Components/HouseholdPieChart';

export default function UserDashboardView({
  user,
  userHousehold,
  householdId,
  uid,
}) {
  const { data: unassignedChoresData = [] } = useQuery(
    ['unassignedChores', householdId],
    () => Chores.getUnassignedChoresByWeekAndHouseHold(week.thisWeek(), householdId),
    { enabled: Boolean(householdId) },
  );

  const { data: householdChoresData = [] } = useQuery(
    ['householdChores', householdId],
    () => Chores.getChoresByHousehold(householdId),
    { enabled: Boolean(householdId) },
  );

  const { data: assignmentData = [] } = useQuery(
    ['assignments', householdId],
    () => assignments.getAssignmentsByHouseHoldId(householdId),
    { enabled: Boolean(householdId) },
  );

  const filteredWeeklyAssignments = useMemo(
    () => assignmentData.filter((x) => x.week === parseInt(week.thisWeek(), 10)),
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

  const myId = useMemo(() => userHousehold?.[0]?.find((uh) => uh.firebaseKey === uid)?.id, [userHousehold, uid]);

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
  const myData = [
    { label: 'Assignments', value: householdChores - unassignedChores },
    { label: 'My done', value: mycompleted },
    { label: 'Other To Do', value: notCompleted - mycompleted },
    { label: 'My To Do', value: myAssignments.length - mycompleted },
  ];

  return (
    <>
      {!!userHousehold && <div className="HouseholdChores">
        <div className="top">
          <div className="groups">
            <div className="logoContainer">
              <div className="leftGroups">
                <div className="Greetings">
                  <span className="logo"> <img src={logo} /></span><div><h1 className="headline">HOUSEHOLD</h1><h4 className="mygreeting">Hi {user.displayName.split(' ')[0]}!</h4>
                  <div className="subtitle">
                    Household Stats for &nbsp;
                    Week {week.thisWeek()}
                  </div></div>
                </div>
                <div className="topContainers">
                  <div>REMAINING TASKS</div>
                  <div><h1>{notCompleted}</h1></div>
                  <div>UNASSIGNED</div>
                  <div><h1>{unassignedChores}</h1></div>
                  <div className="householdPie"><HouseholdPieChart data={housedata} outerRadius={74} innerRadius={20} /></div>
                </div>
              </div>
              <div className="rightGroups">
                <div className="topContainers">
                  <div>YOUR HOUSEHOLD</div>
                  <ul>
                    {userHousehold
                      && userHousehold?.map((person, index) => (
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
          </div>
        </div>
        <div className="bottom">
          <div className="groups">
            <div className="title">
              Your Tasks
            </div>
            <div className="bottomGroup">
              <div className="bottomContainers">
                <div>REMAINING TASKS</div>
                <div><h1>{myAssignments.length - mycompleted}</h1></div>
              </div>
              <div className="bottomContainers">
                <div>FINISHED TASKS</div>
                <div><h1>{mycompleted}</h1></div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>}
    </>
  );
}

  return (
        <>
        {!!userHousehold && <div className="HouseholdChores">
          <div className="top">
            <div className="groups">
              <div className="logoContainer">
                <div className="leftGroups">
                  <div className="Greetings">
                  <span className="logo"> <img src={logo} /></span><div><h1 className="headline">HOUSEHOLD</h1><h4 className="mygreeting">Hi {user.displayName.split(' ')[0]}!</h4>
                  <div className="subtitle">
                    Household Stats for &nbsp;
                    Week {week.thisWeek()}
                  </div></div>
                  </div>
                  <div className="topContainers">
                    <div>REMAINING TASKS</div>
                    <div><h1>{notCompleted}</h1></div>
                    <div>UNASSIGNED</div>
                    <div><h1>{unassignedChores}</h1></div>
                    <div className="householdPie"><HouseholdPieChart data={housedata} outerRadius={74} innerRadius={20} /></div>
                  </div>
                </div>
                <div className="rightGroups">
                    <div className="topContainers">
                      <div>YOUR HOUSEHOLD</div>
                      <ul>
                      {userHousehold
                       && userHousehold?.map((person, index) => (
                           <>
                           <li key={index}>{person.firstname}</li>
                           </>
                       ))}
                      </ul>
                    </div>
                    <div className="topContainers">
                      <div>HOUSEHOLD TASKS</div>
                      <div><h1>{householdChores}</h1></div>
                    </div>
                </div>
              </div>
              </div>
            </div>
            <div className="bottom">
              <div className="groups">
              <div className="title">
                Your Tasks
              </div>
              <div className="bottomGroup">
                <div className="bottomContainers">
                  <div>REMAINING TASKS</div>
                  <div><h1>{myAssignments - mycompleted}</h1></div>
                </div>
                <div className="bottomContainers">
                  <div>FINISHED TASKS</div>
                  <div><h1>{mycompleted}</h1></div>
                </div>
              </div>
              <Footer />
              </div>
            </div>
        </div>}
        </>
  );
}
