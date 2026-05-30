import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card, CardHeader, CardBody, Collapse,
} from 'reactstrap';
import { mergeAssignmentsWithImages } from '../../helpers/MaterialAccordionHelper';
import ImageSmall from '../ImageSmall';

const headerStyle: React.CSSProperties = {
  cursor: 'pointer',
  background: 'linear-gradient(162deg, rgba(25,178,246,1) 4%, rgba(41,128,220,1) 37%, rgba(50,98,205,1) 68%, rgba(61,65,188,1) 100%)',
};

export default function CustomizedAccordions({ userAssignments, images, completeTask }) {
  const newUserAssignments = mergeAssignmentsWithImages(userAssignments, images);

  // Start with all panels closed; clicking a header toggles it without closing others ("leave open")
  const [openPanels, setOpenPanels] = useState<number[]>([]);

  const toggle = (index: number) => {
    setOpenPanels((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div>
      {newUserAssignments.map((item, index) => (
        <Card key={`accord-${item.choreId}-${index}`} className="mb-1">
          <CardHeader style={headerStyle} onClick={() => toggle(index)}>
            <span className="catTitle">{item.categoryName}</span>{' '}
            <span className={item.isCompleted ? 'choreDone' : 'choreTitle'}>
              {item.isCompleted && <i className="fas fa-check" />}
              {item.chorename}
            </span>{' '}
            <span className="nameTitle">{item.firstname}</span>
          </CardHeader>
          <Collapse isOpen={openPanels.includes(index)}>
            {/* Conditionally render body so closed panels have no DOM presence */}
            {openPanels.includes(index) && (
              <CardBody className="choreCorddionBackground">
                <div className="d-flex flex-wrap">
                  {item.image && (
                    <ImageSmall
                      image={item.image}
                      imageId={item.choreId}
                      imageOrdinal={-1}
                      showButtons={false}
                      deleteImage={undefined}
                      onUpdate={() => {}}
                      toggleLeft={() => {}}
                      toggleRight={() => {}}
                    />
                  )}
                  <div>
                    <div className="accordTitle">{item.chorename}</div>
                    <p className="accordDescription">{item.choreDescription}</p>
                    {!item.isCompleted && (
                      <button className="completeButton" onClick={() => completeTask(item)}>
                        Complete Task
                      </button>
                    )}
                  </div>
                  <div>
                    {item.isCompleted && <i className="bigCheck fas fa-check" />}
                    <span className="accordTitle">Week:</span>
                    <p>{item.week}</p>
                    <span className="accordTitle">Status:</span>
                    <p>{item.isCompleted ? 'Complete' : 'Not Complete'}</p>
                    <Link to={`/chore/${item.choreId}`}>Details</Link>
                  </div>
                </div>
              </CardBody>
            )}
          </Collapse>
        </Card>
      ))}
    </div>
  );
}
