/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useMemo, useState, useEffect } from 'react';
import { Formik, Field, Form as FormikForm } from 'formik';
import {
  Button, Card, CardBody, CardHeader, FormGroup, Label, Input,
} from 'reactstrap';
import { useAddChore, useUpdateChore } from '../../data/choresData';
import { useCategories } from '../../data/categoryData';
import { useHousehold } from '../../data/houseHoldUsers';
import { useProfiles } from '../../data/profileData';
import { useChoreProfiles, useAddChoreToProfile, useRemoveChoreFromProfileByIds } from '../../data/profileChoreData';
import { useAuth } from '../../context/AuthContext';
import { Chore } from '../../Types';
import { sortCategories, buildChorePayload } from '../../helpers/FormsHelper';

interface ChoreFormProps {
  choreInfo?: Chore;
  uid: string;
  onUpdate?: () => void;
  toggle?: () => void;
}

interface ChoreFormValues {
  name: string;
  description: string;
  category: string;
  houseHoldId: number;
}

export default function ChoreForm({ choreInfo, uid, onUpdate, toggle }: ChoreFormProps) {
  const { householdId } = useAuth();
  const { data: categories = [] } = useCategories();
  const { data: household } = useHousehold(uid);
  const { data: profiles = [] } = useProfiles(householdId);
  const { data: existingProfileChores = [] } = useChoreProfiles(choreInfo?.id ?? 0);
  const addChoreMutation = useAddChore();
  const updateChoreMutation = useUpdateChore();
  const addToProfile = useAddChoreToProfile();
  const removeFromProfile = useRemoveChoreFromProfileByIds();

  const sortedCategories = useMemo(() => sortCategories(categories), [categories]);

  // Track which profiles are checked — initialised from the DB state for edit mode.
  const [checkedProfileIds, setCheckedProfileIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (existingProfileChores.length > 0) {
      setCheckedProfileIds(new Set(existingProfileChores.map((pc) => pc.profileId)));
    }
  }, [existingProfileChores]);

  const toggleProfile = (profileId: number) => {
    setCheckedProfileIds((prev) => {
      const next = new Set(prev);
      next.has(profileId) ? next.delete(profileId) : next.add(profileId);
      return next;
    });
  };

  const syncProfileMemberships = async (choreId: number) => {
    const existing = new Set(existingProfileChores.map((pc) => pc.profileId));
    const toAdd = [...checkedProfileIds].filter((id) => !existing.has(id));
    const toRemove = [...existing].filter((id) => !checkedProfileIds.has(id));

    await Promise.all([
      ...toAdd.map((profileId) => addToProfile.mutateAsync({ profileId, choreId })),
      ...toRemove.map((profileId) => removeFromProfile.mutateAsync({ choreId, profileId })),
    ]);
  };

  const initialValues: ChoreFormValues = {
    name: choreInfo?.name ?? '',
    description: choreInfo?.description ?? '',
    category: String(choreInfo?.category ?? ''),
    houseHoldId: choreInfo?.houseHoldId ?? household?.householdId ?? 0,
  };

  return (
    <Card className='chore-form'>
      <CardHeader>{choreInfo?.id ? 'Edit Chore' : 'New Chore'}</CardHeader>
      <CardBody>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={async (values) => {
            const choreObject = buildChorePayload(values, choreInfo?.id);
            const mutation = choreInfo?.id ? updateChoreMutation : addChoreMutation;

            mutation.mutate(choreObject, {
              onSuccess: async (saved) => {
                const choreId = (saved as any)?.id ?? choreInfo?.id;
                if (choreId) await syncProfileMemberships(choreId);
                onUpdate?.();
                toggle?.();
              },
            });
          }}
        >
          {({ values, handleChange }) => (
            <FormikForm style={{ width: '75%' }}>
              <FormGroup>
                <Label>Name</Label>
                <Field
                  name='name'
                  as={Input}
                  type='text'
                  className='form-control form-control-lg m-2 inputText'
                  placeholder='Enter a Chore Name'
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Description</Label>
                <Field
                  name='description'
                  as={Input}
                  type='textarea'
                  className='form-control form-control-lg m-2 inputText'
                  placeholder='Enter a Chore Description'
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Category</Label>
                <Input
                  type='select'
                  name='category'
                  value={values.category}
                  onChange={handleChange}
                  className='form-control form-control-lg m-2 inputText'
                  required
                >
                  <option value=''>Select category</option>
                  {sortedCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              {profiles.length > 0 && (
                <FormGroup>
                  <Label>Associated Profiles</Label>
                  <div className="profile-checkbox-list">
                    {profiles.map((p) => (
                      <label key={p.id} className="profile-checkbox-item">
                        <input
                          type="checkbox"
                          checked={checkedProfileIds.has(p.id!)}
                          onChange={() => toggleProfile(p.id!)}
                        />
                        {p.name}
                      </label>
                    ))}
                  </div>
                </FormGroup>
              )}

              <Button type='submit' className='mt-3'>Submit</Button>
            </FormikForm>
          )}
        </Formik>
      </CardBody>
    </Card>
  );
}
