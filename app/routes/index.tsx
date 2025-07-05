import { createRoute } from "honox/factory";
import Twitter from '../components/card/twitter';
import Github from "../components/card/github";
import Uchuemon from "../components/icon/uchuemon";

import SpotlightAndWave from '../islands/SpotLightAndWave';

export default createRoute(async (c) => {
  return c.render(
    <div className="container">
      <SpotlightAndWave />
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>
            Home
          </a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>
            About
          </a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>
            Contact
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Twitter id="sigumataityouda" />
          <Github id="maguro-alternative" />
        </div>
      </div>
      <div className="card" style={{ color: 'white', maxWidth: '80%', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1>ユニコォォォォォォォォォォォォォォォォォーーーーーーーーーン！！！</h1>
            <p>
              This is a sample application built with Honox, showcasing the use of islands and components.
            </p>
            <p>
              Explore the code and see how you can create interactive web applications with ease!
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
            <Uchuemon />
          </div>
        </div>
      </div>
      <div className="footer" style={{ textAlign: 'center', padding: '20px', color: 'white' }}>
        <p>© 2025 Maguro Alternative. All rights reserved.</p>
      </div>
    </div>
  );
});
