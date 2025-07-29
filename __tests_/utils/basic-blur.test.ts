import basicBlur, { averageNeighbourByChannel } from "@/app/utils/basic-blur";
import { getImageDataBuffer, imageDataToDecimalArry, imageDataToPixelMatrix } from "@/app/utils/image-processing";

import { testTinyJPGURL } from '../mocks/msw.mock'
import { decode, RawImageData } from "jpeg-js";
import FetchImageOnClient from "@/app/utils/fetch-image";

let testImageData: Blob
let testImageDataArray: Uint8Array<ArrayBuffer>
let rawImageData: RawImageData<Buffer>

beforeEach(async () => {
  testImageData = await FetchImageOnClient(testTinyJPGURL) as Blob
  testImageDataArray = await getImageDataBuffer(testImageData)
  rawImageData = decode(testImageDataArray)
  console.log("🚀 ~ rawImageData:", rawImageData)
})

describe('basic blur tests', () => {

/*

There's something off with the basic blur, so I'm going to
do some manual calculations

The first test is the 3x3 image `test-image-spectrum-3x3.jpg`
The pixels are:
  red,  orange, yellow,
purple,    red, orange,
  blue, purple,    red,

The colour values are slightly off, even at 100 JPEG
quality, likely due to the JPEG compression algorithm
(perhaps I should switch to PNG for consistency)

red:    254,   0,   0,
orange: 255, 127,   0,
yellow: 254, 255,   1,
purple: 127,   0, 255,
blue:     0,   0, 254,

Therefore the matrices by channel are:
red:
254, 255, 254,
127, 254, 255
  0, 127, 254
sum = 1780
sum / 9 = 197.777...

green:
  0, 127, 255,
  0,   0, 127,
  0,   0,   0,
sum = 509
sum / 9 = 56.555...

blue:
  0,  0,  1,
255,  0,  0,
254, 255, 0,
sum = 765
sum / 9 = 85

And thus our averaged channel values ought to be:
R:198,
G: 57.
B: 85,

Currently getting:
R: 233,
G: 85,
B: 42,

Clearly the values don't match, but what's really odd is it looks like the G/B channel values may be transposed?

Either I've messed up somewhere, or RGB isn't the order
used, which seems unlikely, as AFAIK, the only other order generally used is BGR, depending on decoding method (eg cv2 in Python) and *not* RBG, which the data is suggesting.

So, let's check the raw image data:
{
  '0': 254,
  '1': 0,
  '2': 0,
  '3': 255,
  '4': 254,
  '5': 127,
  '6': 0,
  '7': 255,
  [...]
}

Indices [4, 5, 6] are the colour channel data for pixel 2 (orange) and yes, [254, 127, 0] are the expected RGB values in the correct order.

So... where have I cocked up?
*/
  it('can calculate the average value of each colour channel from the 8 pixels around the central pixel in 3x3px image data', async () => {
    // Central pixel is at coordinates 1,1 in the 3x3 image
    const pixelMatrix = imageDataToPixelMatrix(rawImageData);
    const red = pixelMatrix[1][1][0];
    const averageNeighbourRed = averageNeighbourByChannel(pixelMatrix, 1, 1, 0, 1)

    const green = pixelMatrix[1][1][1];
    const averageNeighbourGreen = averageNeighbourByChannel(pixelMatrix, 1, 1, 1, 1)

    const blue = pixelMatrix[1][1][2];
    const averageNeighbourBlue = averageNeighbourByChannel(pixelMatrix, 1, 1, 2, 1)

    expect(averageNeighbourRed).not.toEqual(red)
    expect(averageNeighbourRed).toEqual(198)

    expect(averageNeighbourGreen).not.toEqual(green)
    expect(averageNeighbourGreen).toEqual(57)

    expect(averageNeighbourBlue).not.toEqual(blue)
    expect(averageNeighbourBlue).toEqual(85)
  })


  it('can perform a basic blur on an image', () => {
    const blurredImageData = basicBlur(rawImageData)
    const dataInDecimal = imageDataToDecimalArry(rawImageData.data)

    expect(blurredImageData).not.toEqual(dataInDecimal);

    expect(blurredImageData).toEqual(new Uint8ClampedArray([
      255,  64,   0, 255, 255, 127,   0, 255, 255, 191,   0, 255,
      223,  32,  64, 255, 234,  85,  43, 255, 255, 127,   0, 255,
      170,  21, 127, 255, 198,  56,  85, 255, 234,  85,  43, 255,
    ]))
  })
})
