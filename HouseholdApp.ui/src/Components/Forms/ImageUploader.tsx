/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Formik, Form as FormikForm } from 'formik';
import {
  Button, Card, CardBody, CardHeader, FormGroup, Label, Input,
} from 'reactstrap';
import { useAddImage } from '../../data/imageData';
import { Chore } from '../../Types';

interface ImageUploaderProps {
  choreInfo: Chore;
  onUpdate?: () => void;
  toggle: () => void;
}

interface ImageUploaderValues {
  files: FileList | null;
}

export default function ImageUploader({ choreInfo, onUpdate, toggle }: ImageUploaderProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const addImageMutation = useAddImage();

  const mutateImage = (image: Partial<{ ChoreId: number; Active: number; Image: string }>) => new Promise<void>((resolve, reject) => {
    addImageMutation.mutate(image, {
      onSuccess: () => resolve(),
      onError: (error) => reject(error),
    });
  });

  return (
    <Card className='assignment-form'>
      <CardHeader>Add Images</CardHeader>
      <CardBody>
        <Formik<ImageUploaderValues>
          initialValues={{ files: null }}
          onSubmit={async (values) => {
            const storage = getStorage();
            const files = values.files;
            if (!files || !choreInfo.id) {
              return;
            }

            const uploads = Array.from(files).map(async (file) => {
              const storageRef = ref(storage, `household-app/${choreInfo.id}/${Date.now()}-${file.name}`);
              const snapshot = await uploadBytes(storageRef, file);
              const imgUrl = await getDownloadURL(snapshot.ref);
              return mutateImage({ ChoreId: choreInfo.id, Active: 1, Image: imgUrl });
            });

            await Promise.all(uploads);
            onUpdate?.();
            toggle();
          }}
        >
          {({ setFieldValue, values }) => (
            <FormikForm style={{ width: '75%' }}>
              <FormGroup>
                <Label htmlFor='files'>Choose images</Label>
                <Input
                  id='files'
                  name='files'
                  type='file'
                  multiple
                  accept='.jpg,.gif,.png,.jpeg'
                  onChange={(event) => {
                    const files = event.currentTarget.files;
                    setFieldValue('files', files);
                    if (files) {
                      const urls = Array.from(files).map((file) => URL.createObjectURL(file));
                      setPreviewUrls(urls);
                    }
                  }}
                />
              </FormGroup>
              <div className='image-preview'>
                {previewUrls.map((url) => <img key={url} src={url} alt='preview' className='img-thumbnail m-1' style={{ maxWidth: '100px' }} />)}
              </div>
              <Button type='submit' className='mt-3'>Submit</Button>
            </FormikForm>
          )}
        </Formik>
      </CardBody>
    </Card>
  );
}
