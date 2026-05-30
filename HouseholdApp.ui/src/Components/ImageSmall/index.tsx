import React from 'react';
import AppModal from '../AppModal';
import DeleteImage from '../Forms/DeleteImage';

export default function Image({
  image,
  imageId,
  deleteImage = undefined,
  imageOrdinal,
  onUpdate = undefined,
  showButtons,
  toggleRight,
  toggleLeft,
}) {
  return (
      <>
      <span key={`${image}-outer`} className="smallFrame">
              {(imageOrdinal >= 0) && (<span className="number">{imageOrdinal + 1}</span>) } <img key={`${image}-img`} className="smallImage" src={image} alt="" />
              { deleteImage && (<AppModal deletePosition="deletePosition" deleteImage={deleteImage} onUpdate={onUpdate} title={'delete'} buttonLabel={'X'}>
               <DeleteImage imageId={imageId} onUpdate={onUpdate} />
            </AppModal>) }
            {showButtons && (<div className="showButtonsOuter">
               <button type="button" onClick = {() => toggleLeft(imageId) } className="reorder left btn"> &lt; left</button>
               <button type="button" onClick = {() => toggleRight(imageId) } className="reorder right btn"> right &gt;</button>
            </div>) }
      </span>
      </>
  );
}
