import '@testing-library/jest-dom'
// `ImageData` is native to the browser, not available in Jest/js-dom
import { ImageData } from 'canvas';
import { render } from '@testing-library/react';

import CanvasImage from '@/app/components/canvas-image';
import { testTinyJPGURL } from '../mocks/msw.mock'
import { decode, RawImageData } from 'jpeg-js';
import FetchImageOnClient from '@/app/fetch-image';
import { getImageDataBuffer } from '@/app/utils/image-processing';

let testImageData: Blob
let testImageDataArray: Uint8Array<ArrayBuffer>
let rawImageData: RawImageData<Buffer>

beforeEach(async () => {
  testImageData = await FetchImageOnClient(testTinyJPGURL) as Blob
  testImageDataArray = await getImageDataBuffer(testImageData)
  rawImageData = decode(testImageDataArray)
})

describe('api fetch tests', () => {
  it('can convert image data into a Canvas element', () => {
    const data = new Uint8ClampedArray(rawImageData.data);
    const { width, height } = rawImageData;
    const NewCanvasImage = (
      <CanvasImage
        // Intellisense complains about `new ImageData()` not neing a
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
