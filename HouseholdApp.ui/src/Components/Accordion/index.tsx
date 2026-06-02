import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card, CardHeader, CardBody, Collapse,
} from 'reactstrap';
import { mergeAssignmentsWithImages } from '../../helpers/AccordionHelper';
import ImageSmall from '../ImageSmall';
import { useAuth } from '../../context/AuthContext';

const headerStyle: React.CSSProperties = {
  cursor: 'pointer',
  background: 'linear-gradient(162deg, rgba(25,178,246,1) 4%, rgba(41,128,220,1) 37%, rgba(50,98,205,1) 68%, rgba(61,65,188,1) 100%)',
};

interface AccordionProps {
  userAssignments: any[];
  images: any[];
  completeTask: (item: any) => void;
  initialOpenChoreId?: number;
  person?: string;
  category?: string;
}

export default function CustomizedAccordions({ userAssignments, images, completeTask, initialOpenChoreId, person, category }: AccordionProps) {
  const { authed } = useAuth();
  const newUserAssignments = mergeAssignmentsWithImages(userAssignments, images);

  const initialIndex = useMemo(
    () => initialOpenChoreId != null
      ? newUserAssignments.findIndex((a) => a.choreId === initialOpenChoreId)
      : null,
    // only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [openPanel, setOpenPanel] = useState<number | null>(initialIndex ?? null);

  const toggle = (index: number) => {
    setOpenPanel((prev) => (prev === index ? null : index));
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
          <Collapse isOpen={openPanel === index}>
            {openPanel === index && (
              <CardBody className="choreCorddionBackground">
                <div className="accordBody">
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
                  <div className="accordMain">
                    <div className="accordTitle">{item.chorename}</div>
                    <p className="accordDescription">{item.choreDescription}</p>
                  </div>
                  <div className="accordMeta">
                    <div>
                      <span className="accordLabel">Week:</span> {item.week}
                    </div>
                    <div>
                      <span className="accordLabel">Status:</span>{' '}
                      {item.isCompleted
                        ? <span className="statusDone"><i className="fas fa-check" /> Complete</span>
                        : <span className="statusPending">Not Complete</span>}
                    </div>
                    <Link to={{ pathname: `/chore/${item.choreId}`, state: { person, category, openChoreId: item.choreId } }}>Details</Link>
                    {authed && !item.isCompleted && (
                      <button className="completeButton" onClick={() => completeTask(item)}>
                        Complete Task
                      </button>
                    )}
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
