import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfiles, useCreateProfile, useDeleteProfile } from '../../data/profileData';
import {
  useProfileChores,
  useUnassignedToProfile,
  useAddChoreToProfile,
  useRemoveChoreFromProfile,
} from '../../data/profileChoreData';
import {
  useProfileAssignmentsByWeek,
  useAssignProfileToUser,
  useRemoveProfileAssignment,
} from '../../data/profileAssignmentData';
import { useChoresByHousehold } from '../../data/choresData';
import { useCategories } from '../../data/categoryData';
import { useAssignmentsByHouseHoldId } from '../../data/assignmentData';
import week from '../../data/weekNum';
import type { Profile, ProfileAssignment } from '../../Types';

// ── Section B helpers ─────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="progress-bar-track">
      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      <span className="progress-bar-label">{Math.round(pct)}%</span>
    </div>
  );
}

function MemberRow({
  member,
  assignment,
  profiles,
  weeklyAssignments,
  onAssign,
  onRemove,
}: {
  member: { id: number; firstname: string };
  assignment: ProfileAssignment | undefined;
  profiles: Profile[];
  weeklyAssignments: any[];
  onAssign: (userId: number, profileId: number) => void;
  onRemove: (id: number) => void;
}) {
  const activeProfileId = assignment?.profile?.id ?? assignment?.profileId;
  const { data: profileChores = [] } = useProfileChores(activeProfileId ?? 0);

  const completedCount = useMemo(() => {
    const choreIds = new Set(profileChores.map((pc) => pc.choreId));
    return weeklyAssignments.filter(
      (a) => a.userId === member.id && choreIds.has(a.choreId) && a.isCompleted,
    ).length;
  }, [profileChores, weeklyAssignments, member.id]);

  const totalChores = profileChores.length;
  const pct = totalChores > 0 ? (completedCount / totalChores) * 100 : 0;

  return (
    <tr className="dispatch-row">
      <td className="dispatch-member">{member.firstname}</td>
      <td className="dispatch-profile">
        <select
          value={activeProfileId ?? ''}
          onChange={(e) => {
            const profileId = Number(e.target.value);
            if (assignment) onRemove(assignment.id!);
            if (profileId) onAssign(member.id, profileId);
          }}
        >
          <option value="">None — Unassigned</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </td>
      <td className="dispatch-progress">
        {activeProfileId ? (
          <ProgressBar pct={pct} />
        ) : (
          <span className="text-muted">No active profile</span>
        )}
      </td>
    </tr>
  );
}

// ── Section A: Profile chore list (sidebar) ───────────────────────────────────

function ProfileChoresSidebar({
  profileId,
  onRemove,
}: {
  profileId: number;
  onRemove: (id: number) => void;
}) {
  const { data: chores = [] } = useProfileChores(profileId);
  if (chores.length === 0)
    return <p className="text-muted sidebar-empty">No chores in this profile yet.</p>;
  return (
    <ul className="profile-sidebar-list">
      {chores.map((pc) => (
        <li key={pc.id} className="profile-sidebar-item">
          <span>{pc.chore?.name ?? pc.chore?.Name ?? `Chore #${pc.choreId}`}</span>
          <button className="btn-remove-chore" onClick={() => onRemove(pc.id!)}>
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function ProfileManagementView() {
  const { householdId, userHousehold } = useAuth();
  const currentWeek = week.thisWeek();

  // Data
  const { data: allChores = [] } = useChoresByHousehold(householdId);
  const { data: profiles = [], refetch: refetchProfiles } = useProfiles(householdId);
  const { data: categories = [] } = useCategories();
  const { data: profileAssignments = [] } = useProfileAssignmentsByWeek(householdId, currentWeek);
  const { data: weeklyAssignments = [] } = useAssignmentsByHouseHoldId(householdId);

  // Mutations
  const addChoreToProfile = useAddChoreToProfile();
  const removeChoreFromProfile = useRemoveChoreFromProfile();
  const createProfile = useCreateProfile();
  const deleteProfile = useDeleteProfile();
  const assignProfile = useAssignProfileToUser();
  const removeAssignment = useRemoveProfileAssignment();

  // Section A state
  const [selectedChoreIds, setSelectedChoreIds] = useState<Set<number>>(new Set());
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');

  // New profile form
  const [newProfileName, setNewProfileName] = useState('');

  const filteredChores = useMemo(() => {
    return allChores.filter((c) => {
      const name = (c.name ?? c.Name ?? '').toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || (c.category ?? c.Category) === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allChores, searchQuery, categoryFilter]);

  const toggleChore = (id: number) => {
    setSelectedChoreIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleApply = async () => {
    if (!selectedProfileId || selectedChoreIds.size === 0) return;
    for (const choreId of selectedChoreIds) {
      await addChoreToProfile.mutateAsync({ profileId: selectedProfileId, choreId });
    }
    setSelectedChoreIds(new Set());
  };

  const handleCreateProfile = () => {
    const trimmed = newProfileName.trim();
    if (!trimmed) return;
    createProfile.mutate({ name: trimmed, householdId }, { onSuccess: () => refetchProfiles() });
    setNewProfileName('');
  };

  const handleMemberAssign = (userId: number, profileId: number) => {
    assignProfile.mutate({ profileId, userId, week: currentWeek, householdId });
  };

  return (
    <div className="command-center">
      <h1 className="command-center-title">Playbook Command Center</h1>

      {/* ── SECTION A ─────────────────────────────────────────────────── */}
      <section className="cc-section">
        <h2 className="cc-section-title">Batch Task-to-Profile Assignment</h2>
        <p className="cc-section-sub">
          Select tasks then choose a profile to assign them to.
        </p>

        <div className="cc-filter-row">
          <input
            className="cc-search"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="cc-category-filter"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
          >
            <option value="all">All Areas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="cc-panels">
          {/* Left: task list */}
          <div className="cc-panel cc-panel-tasks">
            <div className="cc-panel-header">
              TASKS MASTER LIST
              <span className="cc-panel-count">
                {selectedChoreIds.size} selected
              </span>
            </div>
            <ul className="cc-task-list">
              {filteredChores.map((c) => {
                const id = c.id ?? c.Id!;
                const name = c.name ?? c.Name ?? '';
                const checked = selectedChoreIds.has(id);
                return (
                  <li
                    key={id}
                    className={`cc-task-item${checked ? ' cc-task-item--selected' : ''}`}
                    onClick={() => toggleChore(id)}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleChore(id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>{name}</span>
                  </li>
                );
              })}
              {filteredChores.length === 0 && (
                <li className="cc-empty">No tasks match the current filter.</li>
              )}
            </ul>
          </div>

          {/* Arrow indicator */}
          <div className="cc-arrow">→</div>

          {/* Right: profile selector */}
          <div className="cc-panel cc-panel-profiles">
            <div className="cc-panel-header">TARGET PROFILE</div>
            <ul className="cc-profile-list">
              {profiles.map((p) => (
                <li
                  key={p.id}
                  className={`cc-profile-item${selectedProfileId === p.id ? ' cc-profile-item--selected' : ''}`}
                  onClick={() => setSelectedProfileId(p.id!)}
                >
                  <span className="cc-profile-radio">
                    {selectedProfileId === p.id ? '●' : '○'}
                  </span>
                  {p.name}
                </li>
              ))}
              {profiles.length === 0 && (
                <li className="cc-empty">No profiles yet — create one below.</li>
              )}
            </ul>

            {/* Show chores currently in the selected profile */}
            {selectedProfileId && (
              <div className="cc-selected-profile-chores">
                <div className="cc-panel-header">CURRENT CHORES IN PROFILE</div>
                <ProfileChoresSidebar
                  profileId={selectedProfileId}
                  onRemove={(id) => removeChoreFromProfile.mutate(id)}
                />
              </div>
            )}

            <button
              className="btn-apply"
              disabled={!selectedProfileId || selectedChoreIds.size === 0}
              onClick={handleApply}
            >
              Apply Selected Tasks to Profile
            </button>
          </div>
        </div>

        {/* Create profile inline */}
        <div className="cc-create-profile">
          <input
            placeholder="New profile name…"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateProfile()}
          />
          <button
            className="btn-primary"
            onClick={handleCreateProfile}
            disabled={!newProfileName.trim()}
          >
            + Create Profile
          </button>
          {profiles.map((p) => (
            <button
              key={p.id}
              className="btn-danger-sm"
              onClick={() => {
                if (selectedProfileId === p.id) setSelectedProfileId(null);
                deleteProfile.mutate(p.id!);
              }}
              title={`Delete profile "${p.name}"`}
            >
              Delete {p.name}
            </button>
          ))}
        </div>
      </section>

      <hr className="cc-divider" />

      {/* ── SECTION B ─────────────────────────────────────────────────── */}
      <section className="cc-section">
        <h2 className="cc-section-title">Weekly User Dispatch</h2>
        <p className="cc-section-sub">
          Assign a profile blueprint to each household member for Week {currentWeek}.
        </p>

        <table className="dispatch-table">
          <thead>
            <tr>
              <th>Household Member</th>
              <th>Assigned Profile (This Week)</th>
              <th>Status / Progress</th>
            </tr>
          </thead>
          <tbody>
            {userHousehold.map((member) => {
              const assignment = profileAssignments.find((pa) => pa.userId === member.id);
              return (
                <MemberRow
                  key={member.id}
                  member={member}
                  assignment={assignment}
                  profiles={profiles}
                  weeklyAssignments={weeklyAssignments}
                  onAssign={handleMemberAssign}
                  onRemove={(id) => removeAssignment.mutate(id)}
                />
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
