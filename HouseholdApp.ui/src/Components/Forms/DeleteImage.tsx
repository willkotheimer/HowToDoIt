import React from 'react';
import { useDeleteImage } from '../../data/imageData';

interface DeleteImageProps {
  imageId: number;
  onUpdate?: () => void;
  toggle?: () => void;
}

export default function DeleteImage({ imageId, onUpdate, toggle }: DeleteImageProps) {
  const deleteImageMutation = useDeleteImage();

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    deleteImageMutation.mutate(imageId, {
      onSuccess: () => {
        onUpdate?.();
        toggle();
      },
    });
  };

  return (
    <div>
      <p>Are you sure you want to delete this image?</p>
      <button type='button' onClick={handleSubmit}>Delete</button>
    </div>
  );
}
