import { createRoute } from "honox/factory";
import Twitter from '../components/card/twitter';
import Github from "../components/card/github";
import Uchuemon from "../components/icon/uchuemon";

import SpotlightAndWave from '../islands/SpotLightAndWave';

export default createRoute(async (c) => {
  return c.render(
    <div className="container mx-auto">
      <SpotlightAndWave />
      <div className="flex md:flex-row justify-between items-center p-2">
        <div className="flex gap-5 mb-2.5 md:mb-0 p-2 text-white">
          <a href="#" className="no-underline">
            Home
          </a>
          <a href="#" className="no-underline">
            About
          </a>
          <a href="#" className="no-underline">
            Contact
          </a>
        </div>
        <div className="flex items-center">
          <Twitter id="sigumataityouda" />
          <Github id="maguro-alternative" />
        </div>
      </div>
      <div className="text-white max-w-4/5 mx-auto">
        <div className="flex md:flex-row justify-center items-center mb-5">
          <div className="md:w-1/2">
            <h1 className="text-4xl">ユニコォォォォォォォォォォォォォォォォォーーーーーーーーーン！！！</h1>
            <p>
              This is a sample application built with Honox, showcasing the use of islands and components.
            </p>
            <p>
              Explore the code and see how you can create interactive web applications with ease!
            </p>
          </div>
          <div className="flex justify-center items-center mb-5 md:w-1/2">
            <Uchuemon />
          </div>
        </div>
      </div>
      <div className="text-center p-5 text-white">
        <p>© 2025 Maguro Alternative. All rights reserved.</p>
      </div>
    </div>
  );
});