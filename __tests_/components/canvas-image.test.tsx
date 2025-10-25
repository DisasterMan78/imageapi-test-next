import '@testing-library/jest-dom'
// `ImageData` is native to the browser, not available in Jest/js-dom
import { ImageData } from 'canvas'
import { render } from '@testing-library/react'
import { RawImageData } from 'jpeg-js'

import CanvasImage from '@/app/components/canvas-image'
import { fetchAndDecodeToImageData } from '@/app/utils/image-processing'

import { testTinyJPGURL } from '../mocks/msw.mock'

let rawImageData: RawImageData<Buffer>

beforeEach(async () => {
  rawImageData = await fetchAndDecodeToImageData(testTinyJPGURL) as RawImageData<Buffer>
})

describe('api fetch tests', () => {
  it('can convert image data into a Canvas element', () => {
    const data = new Uint8ClampedArray(rawImageData.data);
    const { width, height } = rawImageData;
    const NewCanvasImage = (
      <CanvasImage
        // Intellisense complains about `new ImageData()` not being a
        // perfect match because we are using the version from the
        // `canvas` package, but works fine for tests
        imageData={
          new ImageData(data, width, height)
        }
        width={width}
        height={height}
      />
    );
    const App = () => {
      return NewCanvasImage
    }
    const { container } = render(<App />);

    const canvas = container.querySelector('canvas') as HTMLCanvasElement
    const canvasData = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, '')
    const snapshot = Buffer.from(canvasData, 'base64')

    // Intellisense complaims about `toMatchImageSnapshot()` but it
    // has been added to `expect()` in `./jest.setup.js`
    expect(snapshot).toMatchImageSnapshot({ failureThreshold: 0 })
  })
})
