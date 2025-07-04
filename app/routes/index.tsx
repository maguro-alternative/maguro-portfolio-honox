import { createRoute } from "honox/factory";
import Twitter from '../components/card/twitter';
import Github from "../components/card/github";
import Uchuemon from "../components/icon/uchuemon";

import SpotlightAndWave from '../islands/SpotLightAndWave';

export default createRoute(async (c) => {
  return c.render(
    <div className="container">
      <SpotlightAndWave />
      <div className="header" style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', padding: '10px' }}>
        <Twitter id="sigumataityouda" />
        <Github id="maguro-alternative" />
      </div>
      <div className="card" style={{ color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
          <Uchuemon />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1>ユニコォォォォォォォォォォォォォォォォォーーーーーーーーーン！！！</h1>
          <p>
            This is a sample application built with Honox, showcasing the use of islands and components.
          </p>
          <p>
            Explore the code and see how you can create interactive web applications with ease!
          </p>
          </div>
      </div>
    </div>
  );
});
