/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useMemo } from 'react';
import { Formik, Field, Form as FormikForm } from 'formik';
import {
  Button, Card, CardBody, CardHeader, FormGroup, Label, Input,
} from 'reactstrap';
import { useAddChore, useUpdateChore } from '../../data/choresData';
import { useCategories } from '../../data/categoryData';
import { useHousehold } from '../../data/houseHoldUsers';
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
  const { data: categories = [] } = useCategories();
  const { data: household } = useHousehold(uid);
  const addChoreMutation = useAddChore();
  const updateChoreMutation = useUpdateChore();

  const sortedCategories = useMemo(() => sortCategories(categories), [categories]);

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
          onSubmit={(values) => {
            const choreObject = buildChorePayload(values, choreInfo?.id);
            const mutation = choreInfo?.id ? updateChoreMutation : addChoreMutation;

            mutation.mutate(choreObject, {
              onSuccess: () => {
                onUpdate?.();
                toggle();
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
              <Button type='submit' className='mt-3'>Submit</Button>
            </FormikForm>
          )}
        </Formik>
      </CardBody>
    </Card>
  );
}
