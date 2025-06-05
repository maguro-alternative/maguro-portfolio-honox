import { createRoute } from "honox/factory";
import Twitter from '../components/card/twitter';

import SpotlightAndWave from '../islands/SpotLightAndWave';

export default createRoute(async (c) => {
  return c.render(
    <div className="container">
      <SpotlightAndWave />
      <Twitter id="sigumataityouda" />
    </div>
  );
});
