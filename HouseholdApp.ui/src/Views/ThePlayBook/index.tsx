import React from 'react';
import { useHistory } from 'react-router-dom';
import logo from '../../styles/images/Household_logo_white.svg';
import Bedroom1 from '../../styles/images/bedroom.jpg';
import Bedroom2 from '../../styles/images/Bedroomnightstand.jpg';
import ClosetOpen from '../../styles/images/closetopen.jpg';
import Kitchen from '../../styles/images/kitchen.jpg';
import Laundry from '../../styles/images/laundry.jpeg';
import ShoeRack from '../../styles/images/shoerack1.jpg';
import Shower from '../../styles/images/shower.jpg';

const photos = [Bedroom1, Kitchen, ClosetOpen, Laundry, Bedroom2, Shower, ShoeRack];

export default function ThePlayBook() {
  const history = useHistory();

  return (
    <div className="tpb-page">
      <div className="tpb-hero">
        <img src={logo} alt="The Play Book" className="tpb-logo" />
        <h1 className="tpb-title">The Play Book</h1>
        <p className="tpb-tagline">Your household's chore system — organized, assigned, done.</p>

        <div className="tpb-cta-row">
          <button className="tpb-cta tpb-cta--primary" onClick={() => history.push('/dashboard')}>
            Dashboard
          </button>
          <button className="tpb-cta tpb-cta--secondary" onClick={() => history.push('/playbook')}>
            The Runbook
          </button>
        </div>
      </div>

      <div className="tpb-strip">
        {photos.map((src, i) => (
          <img key={i} src={src} alt="household chore" className="tpb-strip-img" />
        ))}
      </div>
    </div>
  );
}
