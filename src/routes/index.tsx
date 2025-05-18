import { Hono } from 'hono'
import { renderer } from '../renderer'
import { createRoute } from "honox/factory";
import Twitter from '../../app/components/card/twitter';

import SpotlightAndWave from '../islands/SpotLightAndWave';

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(
    <div>
      <Twitter id="sigumataityouda"/>
      <SpotlightAndWave/>
    </div>
  )
})

export default app
