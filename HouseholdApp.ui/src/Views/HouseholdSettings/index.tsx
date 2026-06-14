import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHouseholdSettings, useUpdateHouseholdSettings } from '../../data/settingsData';

export default function HouseholdSettingsView() {
  const { householdId } = useAuth();
  const { data: settings } = useHouseholdSettings(householdId);
  const update = useUpdateHouseholdSettings();

  const [maxChores, setMaxChores] = useState(10);
  const [rollover, setRollover] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setMaxChores(settings.maxChoresPerProfile);
      setRollover(settings.rolloverEnabled);
    }
  }, [settings]);

  const handleSave = () => {
    if (!settings) return;
    update.mutate(
      { ...settings, maxChoresPerProfile: maxChores, rolloverEnabled: rollover },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      },
    );
  };

  return (
    <div className="settings-view">
      <h1>Household Settings</h1>

      <div className="settings-form">
        <div className="settings-field">
          <label htmlFor="maxChores">Max chores per profile</label>
          <input
            id="maxChores"
            type="number"
            min={1}
            max={50}
            value={maxChores}
            onChange={(e) => setMaxChores(Number(e.target.value))}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="rollover">Roll over profile assignments each week</label>
          <input
            id="rollover"
            type="checkbox"
            checked={rollover}
            onChange={(e) => setRollover(e.target.checked)}
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={update.isLoading || !settings}
        >
          {update.isLoading ? 'Saving…' : 'Save Settings'}
        </button>

        {saved && <span className="save-confirm">Saved!</span>}
      </div>
    </div>
  );
}
