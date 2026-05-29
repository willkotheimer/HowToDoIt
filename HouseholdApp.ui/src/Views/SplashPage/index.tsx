import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Auth from '../../Components/Auth';
import Bedroom1 from '../../styles/images/bedroom.jpg';
import Bedroom2 from '../../styles/images/Bedroomnightstand.jpg';
import ClosetOpen from '../../styles/images/closetopen.jpg';
import Desk1 from '../../styles/images/desk.jpg';
import Desk2 from '../../styles/images/desk2.jpg';
import Kitchen from '../../styles/images/kitchen.jpg';
import Laundry1 from '../../styles/images/laundry.jpeg';
import Laundry2 from '../../styles/images/Laundry.jpg';
import ShoeRack1 from '../../styles/images/shoerack1.jpg';
import Shower from '../../styles/images/shower.jpg';

export default function SplashPage(props) {
  return (
    <Container className="splash">
      <Row>
        <Col className="col-3">{<img alt='organized house' src={Bedroom1} />}</Col>
        <Col className="col-3">{<img alt='organized house' src={Bedroom2} />}</Col>
        <Col className="col-3">{<img alt='organized house' src={ClosetOpen} />}</Col>
        <Col className="col-3">{<img alt='organized house' src={Desk1} />}</Col>
      </Row>
      <Row>
        <Col className="col-3">{<img alt='organized house' src={Desk2} />}</Col>
        <Col className="splash-title col-6"><div>
        <div><Auth /></div></div>
        </Col>
        <Col className="col-3">{<img alt='organized house' src={Kitchen} />}</Col>
      </Row>
      <Row>
        <Col className="col-3">{<img alt='organized house' src={Laundry1} />}</Col>
        <Col className="col-3">{<img alt='organized house' src={Laundry2} />}</Col>
        <Col className="col-3">{<img alt='organized house' src={ShoeRack1} />}</Col>
        <Col className="col-3">{<img alt='organized house' src={Shower} />}</Col>
      </Row>

    </Container>
  );
}
