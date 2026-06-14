import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfiles, useCreateProfile, useDeleteProfile, useUpdateProfile } from '../../data/profileData';
import { useProfileChores, useUnassignedToProfile, useAddChoreToProfile, useRemoveChoreFromProfile } from '../../data/profileChoreData';
import type { Profile, Chore } from '../../Types';

function ProfileChoreList({ profileId, onRemove }: { profileId: number; onRemove: (id: number) => void }) {
  const { data: chores = [] } = useProfileChores(profileId);
  if (chores.length === 0) return <p className="text-muted">No chores assigned to this profile.</p>;
  return (
    <ul className="profile-chore-list">
      {chores.map((pc) => (
        <li key={pc.id} className="profile-chore-item">
          <span>{pc.chore?.name ?? pc.chore?.Name ?? `Chore #${pc.choreId}`}</span>
          <button className="btn-remove" onClick={() => onRemove(pc.id!)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}

function ProfileCard({
  profile,
  householdId,
  onDelete,
}: {
  profile: Profile;
  householdId: number;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [adding, setAdding] = useState(false);
  const updateProfile = useUpdateProfile();
  const addChore = useAddChoreToProfile();
  const removeChore = useRemoveChoreFromProfile();
  const { data: unassigned = [] } = useUnassignedToProfile(householdId);

  const handleRename = () => {
    if (name.trim() && name !== profile.name) {
      updateProfile.mutate({ ...profile, name: name.trim() });
    }
    setEditing(false);
  };

  const handleAddChore = (chore: Chore) => {
    addChore.mutate({ profileId: profile.id!, choreId: chore.id ?? chore.Id! });
    setAdding(false);
  };

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        {editing ? (
          <span className="profile-name-edit">
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <button onClick={handleRename}>Save</button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </span>
        ) : (
          <span className="profile-name">
            {profile.name}
            <button className="btn-icon" onClick={() => setEditing(true)}>✎</button>
          </span>
        )}
        <button className="btn-danger" onClick={() => onDelete(profile.id!)}>Delete</button>
      </div>

      <ProfileChoreList profileId={profile.id!} onRemove={(id) => removeChore.mutate(id)} />

      {adding ? (
        <div className="add-chore-panel">
          {unassigned.length === 0 ? (
            <p className="text-muted">All chores are assigned to a profile.</p>
          ) : (
            <ul className="unassigned-chore-picker">
              {unassigned.map((c) => (
                <li key={c.id ?? c.Id}>
                  <button className="btn-link" onClick={() => handleAddChore(c)}>
                    + {c.name ?? c.Name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button className="btn-secondary" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      ) : (
        <button className="btn-secondary" onClick={() => setAdding(true)}>+ Add Chore</button>
      )}
    </div>
  );
}

export default function ProfileManagementView() {
  const { householdId } = useAuth();
  const { data: profiles = [] } = useProfiles(householdId);
  const { data: unassigned = [] } = useUnassignedToProfile(householdId);
  const createProfile = useCreateProfile();
  const deleteProfile = useDeleteProfile();
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createProfile.mutate({ name: trimmed, householdId });
    setNewName('');
  };

  return (
    <div className="profile-management">
      <h1>Profiles</h1>

      <div className="create-profile-row">
        <input
          placeholder="New profile name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button className="btn-primary" onClick={handleCreate} disabled={!newName.trim()}>
          Create Profile
        </button>
      </div>

      <div className="profiles-grid">
        {profiles.map((p) => (
          <ProfileCard
            key={p.id}
            profile={p}
            householdId={householdId}
            onDelete={(id) => deleteProfile.mutate(id)}
          />
        ))}
      </div>

      <section className="unassigned-section">
        <h2>Unassigned Chores</h2>
        <p className="text-muted">Chores not yet added to any profile.</p>
        {unassigned.length === 0 ? (
          <p>All chores are assigned to a profile.</p>
        ) : (
          <ul className="unassigned-list">
            {unassigned.map((c) => (
              <li key={c.id ?? c.Id}>{c.name ?? c.Name}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
