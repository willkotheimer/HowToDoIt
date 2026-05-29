import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ImageSmall from '../ImageSmall';

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    background: 'linear-gradient(162deg, rgba(25,178,246,1) 4%, rgba(41,128,220,1) 37%, rgba(50,98,205,1) 68%, rgba(61,65,188,1) 100%)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 50,
    '&$expanded': {
      minHeight: 50,
    },
  },
  content: {
    '&$expanded': {
      margin: '20px 0',
      backgroundColor: 'rgba(228, 241, 254, 1)',
    },
  },
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
}))(MuiAccordionDetails);

export default function CustomizedAccordions({ userAssignments, images, completeTask }) {
  const [expanded, setExpanded] = React.useState('panel1');
  const newUserAssignments = [];
  let myObj = {};
  userAssignments.forEach((ua, i) => {
    myObj = ua;
    const theImage = images.find((image) => ua.choreId === image.choreId);
    if (theImage) myObj.image = theImage.image;
    newUserAssignments.push(myObj);
  });
  const gettasks = () => (
    [...newUserAssignments].map((item, index) => (
        <Accordion key={`accord${item}-${index}`} square expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)}>
        <AccordionSummary key={`accordsummary${item}`} aria-controls="paneld-content" id="panelheader">
          <Typography component={'span'} key={`typo1-${item}`}><span className="catTitle">{item.categoryName}</span> <span className={item.isCompleted ? 'choreDone' : 'choreTitle'}>{item.isCompleted ? (<i className="fas fa-check"></i>) : ''}{item.chorename}</span> <span className="nameTitle">{ item.firstname }</span></Typography>
        </AccordionSummary>
        <AccordionDetails className="choreCorddionBackground" key={`accordDetails-${item}`}>
          <Typography>
              { item.image && <ImageSmall image={item.image} /> }
          </Typography>
          <Typography component={'span'} key={`typo2-${item}`}>
            <div className='accordTitle' key={`div2-${item}`}>{item.chorename}</div>
            <p className='accordDescription' key={`p-${item}`}>{item.choreDescription}</p>
            { (!item.isCompleted) && <button className="completeButton" onClick={() => completeTask(item)}>Complete Task</button>}
          </Typography>
          <Typography component={'span'} key={`typo3-${item}`}>
            {item.isCompleted ? (<i className="bigCheck fas fa-check"></i>) : ''}
            <span className='accordTitle'>Week:</span>
            <p key={`p2-${item}`}>{item.week}</p>
            <span className='accordTitle'>Status:</span>
            <p key={`p3-${item}`}>{(item.isCompleted) ? 'Complete' : 'Not Complete'}</p>
            <Link to={{ pathname: `/chore/${item.choreId}` }}>Details</Link>
          </Typography>
        </AccordionDetails>
      </Accordion>
    )));

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  return (
    <div>
        { gettasks()}
    </div>
  );
}
