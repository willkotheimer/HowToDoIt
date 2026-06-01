import React, { useState, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody } from 'reactstrap';
import images from '../../data/imageData';
import { useChoreById } from '../../data/choresData';
import { useImagesByChoreId } from '../../data/imageData';
import ChoreInfo from '../../Components/ChoreInfo';
import AppModal from '../../Components/AppModal';
import ChoreForm from '../../Components/Forms/ChoreForm';
import Uploader from '../../Components/Forms/ImageUploader';
import ChoreImages from '../../Components/ChoresImages';
import logo from '../../styles/images/logo.png';
import { Chore } from '../../Types';
import { useAuth } from '../../context/AuthContext';
import { getSandboxImageOrder, setSandboxImageOrder } from '../../data/sandbox/imageOrder';

export default function ChoreDetailsView({ props }) {
  const { user, authed } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const returnState = (location.state || {}) as { person?: string; category?: string; openChoreId?: number };
  const { id } = props.match.params;
  const choreId = Number(id);

  const [imageOrder, setImageOrder] = useState<number[]>(
    () => (!authed ? getSandboxImageOrder(choreId) ?? [] : []),
  );
  const [choreOrderButtons, setChoreOrderButtons] = useState(false);

  const { data: choreImages = [], refetch: refetchChoreImages } = useImagesByChoreId(choreId);
  const { data: choreInfo = {} as Chore } = useChoreById(choreId);

  const orderedChoreImages = useMemo(
    () => (imageOrder.length
      ? choreImages.filter((image) => imageOrder.includes(image.id)).sort((a, b) => imageOrder.indexOf(a.id) - imageOrder.indexOf(b.id))
      : choreImages),
    [choreImages, imageOrder],
  );

  const updateImageOrder = (newOrder: number[]) => {
    setImageOrder(newOrder);
    if (!authed) setSandboxImageOrder(choreId, newOrder);
  };

  const toggleChoresOrder = () => setChoreOrderButtons((prev) => !prev);

  const arrayMove = (arr: number[], oldIndex: number, newIndex: number) => {
    const newArr = [...arr];
    while (newIndex < 0) newIndex += newArr.length;
    if (newIndex >= newArr.length) {
      let k = newIndex - newArr.length + 1;
      while (k--) newArr.push(undefined as unknown as number);
    }
    newArr.splice(newIndex, 0, newArr.splice(oldIndex, 1)[0]);
    return newArr;
  };

  const toggleLeft = (imageID: number) => {
    const order = imageOrder.length ? imageOrder : choreImages.map((img) => img.id);
    const index = order.indexOf(imageID);
    if (index < 0) return;
    updateImageOrder(arrayMove(order, index, index - 1));
  };

  const toggleRight = (imageID: number) => {
    const order = imageOrder.length ? imageOrder : choreImages.map((img) => img.id);
    const index = order.indexOf(imageID);
    if (index < 0) return;
    updateImageOrder(arrayMove(order, index, (index + 1) % order.length));
  };

  const deleteImage = async (imageId: number) => {
    await images.deleteImage(imageId);
    await refetchChoreImages();
  };

  return (
    <Card className="ChoreDetails">
      <CardHeader>
        <div className="choreDetailsHeader">
          <img src={logo} alt="logo" className="headerLogo" />
          <h1>Chore Details: {choreInfo?.name}</h1>
          <button className="choreCloseBtn" onClick={() => history.push('/assignmentBoard', returnState)}>✕</button>
        </div>
      </CardHeader>
      <CardBody>
        <div className="top">
          <div className="groups">
            <div className="leftGroups">
              <div className="Greetings">
                <div className="topContainers rightContainer">
                  <AppModal title="Edit Chore" buttonLabel="Edit Chore">
                    <ChoreForm choreInfo={choreInfo} uid={user?.uid ?? ''} onUpdate={refetchChoreImages} />
                  </AppModal>
                  <ChoreInfo choreInfo={choreInfo} />
                </div>
                <div className="topContainers leftContainer">
                  <div className="timeLabel">Estimated Time to Complete</div>
                  <div className="timeValue">1 Hour</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom">
          {authed && (
            <AppModal title="Add Image" buttonLabel="Add Image">
              <Uploader choreInfo={choreInfo} onUpdate={refetchChoreImages} />
            </AppModal>
          )}
          {/* Reorder available to all */}
          <button className="btn btn-danger" onClick={toggleChoresOrder}>Reorder Images</button>
          <div className="groups">
            {orderedChoreImages.length > 0 && (
              <ChoreImages
                choreImages={orderedChoreImages}
                onUpdate={refetchChoreImages}
                deleteImage={deleteImage}
                showButtons={choreOrderButtons}
                toggleRight={toggleRight}
                toggleLeft={toggleLeft}
              />
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
