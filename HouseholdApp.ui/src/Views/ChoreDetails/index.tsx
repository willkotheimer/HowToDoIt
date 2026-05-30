import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardBody } from 'reactstrap';
import images from '../../data/imageData';
import chores from '../../data/choresData';
import ChoreInfo from '../../Components/ChoreInfo';
import AppModal from '../../Components/AppModal';
import ChoreForm from '../../Components/Forms/ChoreForm';
import Uploader from '../../Components/Forms/ImageUploader';
import ChoreImages from '../../Components/ChoresImages';
import logo from '../../styles/images/logo.png';
import Footer from '../../Components/Footer';
import { Chore, ImageRecord } from '../../Types';

export default function ChoreDetailsView({ props, user }) {
  const { id } = props.match.params;
  const [imageOrder, setImageOrder] = useState<number[]>([]);
  const [choreOrderButtons, setChoreOrderButtons] = useState(false);

  const {
    data: choreImages = [],
    refetch: refetchChoreImages,
  } = useQuery<ImageRecord[]>(['choreImages', id], () => images.getImagesByChoreId(Number(id)), {
    enabled: Boolean(id),
  });

  const {
    data: choreInfo = {} as Chore,
  } = useQuery<Chore>(['choreInfo', id], () => chores.GetChoreById(Number(id)), {
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (choreImages?.length) {
      setImageOrder(choreImages.map((image) => image.id));
    }
  }, [choreImages]);

  const orderedChoreImages = useMemo(
    () => (imageOrder.length ? choreImages.filter((image) => imageOrder.includes(image.id)).sort((a, b) => imageOrder.indexOf(a.id) - imageOrder.indexOf(b.id)) : choreImages),
    [choreImages, imageOrder],
  );

  const toggleChoresOrder = () => {
    setChoreOrderButtons((prev) => !prev);
  };

  const arrayMove = (arr: number[], oldIndex: number, newIndex: number) => {
    const newArr = [...arr];
    while (newIndex < 0) {
      newIndex += newArr.length;
    }
    if (newIndex >= newArr.length) {
      let k = newIndex - newArr.length + 1;
      while (k--) {
        newArr.push(undefined as unknown as number);
      }
    }
    newArr.splice(newIndex, 0, newArr.splice(oldIndex, 1)[0]);
    return newArr;
  };

  const toggleLeft = (imageID: number) => {
    const index = imageOrder.indexOf(imageID);
    if (index < 0) return;
    setImageOrder((prev) => arrayMove(prev, index, index - 1));
  };

  const toggleRight = (imageID: number) => {
    const index = imageOrder.indexOf(imageID);
    if (index < 0) return;
    setImageOrder((prev) => arrayMove(prev, index, (index + 1) % prev.length));
  };

  const deleteImage = async (imageId: number) => {
    await images.deleteImage(imageId);
    await refetchChoreImages();
  };

  return (
    <Card className="ChoreDetails">
      <CardHeader>
        <h1>Chore Details</h1>
      </CardHeader>
      <CardBody>
        <div className="top">
          <div className="groups">
            <div className="leftGroups">
              <div className="Greetings">
                <div className="logo"><img alt="logo" src={logo} /></div>
                <div>
                  <h3 className="mygreeting">Chore: {choreInfo?.name}</h3>
                  <div>
                    <h5>Hi {user?.displayName?.split(' ')[0]}</h5>
                  </div>
                  <div className="subtitle">
                    Household Stats for &nbsp;
                    Week 25
                  </div>
                  <div className="topContainers leftContainer">
                    Estimated Time to Complete
                    1 Hour
                  </div>
                </div>
                <div className="topContainers rightContainer">
                  <AppModal choreInfo={choreInfo} choreImages={choreImages} title="Edit Chore" buttonLabel="Edit Chore">
                    <ChoreForm choreInfo={choreInfo} choreImages={choreImages} onUpdate={refetchChoreImages} />
                  </AppModal>
                  <ChoreInfo choreInfo={choreInfo} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom">
          <AppModal choreInfo={choreInfo} choreImages={choreImages} title="Add Image" buttonLabel="Add Image">
            <Uploader choreInfo={choreInfo} choreImages={choreImages} onUpdate={refetchChoreImages} />
          </AppModal>
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
      <Footer />
    </Card>
  );
}
