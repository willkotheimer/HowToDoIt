import React from 'react';
import ImageSmall from '../ImageSmall';

export default function ChoresImages({
  choreImages,
  deleteImage,
  onUpdate,
  showButtons,
  toggleRight,
  toggleLeft,
}) {
  const myImages = () => choreImages.map((img, i) => (<ImageSmall
    deleteImage={deleteImage}
    imageOrdinal={i}
    onUpdate={onUpdate}
    key={img.id}
    imageId={img.id}
    image={img.image}
    showButtons={showButtons}
    toggleLeft={toggleLeft}
    toggleRight={toggleRight}
  />));

  return (
        <div className="d-flex">
        { choreImages && myImages() }
        </div>
  );
}
