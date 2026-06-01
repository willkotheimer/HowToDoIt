import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';
import CustomizedAccordions from '../MaterialAccordion';
import { useAssignmentsByHouseholdFromUserId, useSetAssignmentAsDone } from '../../data/assignmentData';
import images from '../../data/imageData';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { sanitizeAssignmentNames } from '../../data/sandbox/members';

export default function AddHouseholdMembers({ uid, user, userHousehold }) {
  const { authed } = useAuth();
  const location = useLocation();
  const returnState = (location.state || {}) as { person?: string; category?: string; openChoreId?: number };

  const userId = useMemo(
    () => uid
      ? userHousehold?.find((uh) => uh.firebaseKey === uid)?.id
      : userHousehold?.[0]?.id,
    [uid, userHousehold],
  );

  const { data: rawAssignmentsUsers = [] } = useAssignmentsByHouseholdFromUserId(userId);
  const { data: imageArray = [] } = useQuery(['mainImages'], images.getMainImageByChoreId);
  const setAssignmentDoneMutation = useSetAssignmentAsDone();

  const assignmentsUsers = useMemo(
    () => (!authed ? sanitizeAssignmentNames(rawAssignmentsUsers) : rawAssignmentsUsers),
    [authed, rawAssignmentsUsers],
  );

  const grouped = useMemo(
    () => (assignmentsUsers as any[]).reduce((acc, a) => {
      if (!acc[a.firstname]) acc[a.firstname] = {};
      if (!acc[a.firstname][a.categoryName]) acc[a.firstname][a.categoryName] = [];
      acc[a.firstname][a.categoryName].push(a);
      return acc;
    }, {} as Record<string, Record<string, any[]>>),
    [assignmentsUsers],
  );

  const people = Object.keys(grouped);

  const [activePerson, setActivePerson] = useState(returnState.person || '');
  const [activeCategory, setActiveCategory] = useState(returnState.category || '');

  const currentPerson = activePerson || people[0] || '';
  const categories = currentPerson ? Object.keys(grouped[currentPerson] || {}) : [];
  const currentCategory = (activeCategory && categories.includes(activeCategory))
    ? activeCategory
    : categories[0] || '';

  const handlePersonChange = (name: string) => {
    setActivePerson(name);
    setActiveCategory('');
  };

  const completeTask = (assignment) => {
    setAssignmentDoneMutation.mutate({
      id: assignment.assignmentId,
      userId: parseInt(assignment.userId, 10),
      week: assignment.week,
      isCompleted: assignment.isCompleted,
      rating: assignment.rating,
      choreId: assignment.choreId,
    });
  };

  return (
    <div className="createHousehold">
      <h1>Household Chores</h1>
      {people.length === 0 ? (
        <p style={{ color: '#fff' }}>No assignments found.</p>
      ) : (
        <div className="assignmentBox">
          <div className="assignmentTabs">
            <Nav tabs>
              {people.map((name) => (
                <NavItem key={name}>
                  <NavLink
                    active={currentPerson === name}
                    onClick={() => handlePersonChange(name)}
                    style={{ cursor: 'pointer' }}
                  >
                    {name}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>

            <TabContent activeTab={currentPerson}>
              {people.map((name) => (
                <TabPane key={name} tabId={name}>
                  <div className="categoryLayout">
                    <Nav vertical className="categoryNav">
                      {Object.keys(grouped[name]).map((cat) => (
                        <NavItem key={cat}>
                          <NavLink
                            active={currentCategory === cat && currentPerson === name}
                            onClick={() => setActiveCategory(cat)}
                            style={{ cursor: 'pointer' }}
                          >
                            {cat}
                          </NavLink>
                        </NavItem>
                      ))}
                    </Nav>

                    <TabContent activeTab={currentCategory} className="categoryContent">
                      {Object.entries(grouped[name]).map((entry) => {
                        const cat = entry[0] as string;
                        const items = entry[1] as any[];
                        const isActive = name === (activePerson || people[0]) && cat === currentCategory;
                        return (
                          <TabPane key={cat} tabId={cat}>
                            <CustomizedAccordions
                              images={imageArray}
                              userAssignments={items}
                              completeTask={completeTask}
                              person={name}
                              category={cat}
                              initialOpenChoreId={isActive ? returnState.openChoreId : undefined}
                            />
                          </TabPane>
                        );
                      })}
                    </TabContent>
                  </div>
                </TabPane>
              ))}
            </TabContent>
          </div>
        </div>
      )}
    </div>
  );
}
