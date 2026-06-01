import React from 'react';
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

const photos = [Bedroom1, Bedroom2, ClosetOpen, Desk1, Desk2, Kitchen, Laundry1, Laundry2, ShoeRack1, Shower];

export default function SplashPage() {
  return (
    <div className="splash">
      <div className="splashHero">
        <Auth variant="splash" />
      </div>
      <div className="splashStrip">
        {photos.map((src, i) => (
          <img key={i} src={src} alt="organized house" />
        ))}
      </div>
    </div>
  );
}
