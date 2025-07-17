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
})

describe('basic blur tests', () => {
  it('can calculate the average value of each colour channel from the 8 pixels around a given pixel in some image data', async () => {
    const pixelMatrix = imageDataToPixelMatrix(rawImageData);
    const red = pixelMatrix[1][1][0];
    const averageNeighbourRed = averageNeighbourByChannel(pixelMatrix, 1, 1, 0, {})

    const green = pixelMatrix[1][1][1];
    const averageNeighbourGreen = averageNeighbourByChannel(pixelMatrix, 1, 1, 1, {})

    const blue = pixelMatrix[1][1][2];
    const averageNeighbourBlue = averageNeighbourByChannel(pixelMatrix, 1, 1, 2, {})

    expect(averageNeighbourRed).not.toEqual(red)
    expect(averageNeighbourRed).toEqual(198)

    expect(averageNeighbourGreen).not.toEqual(green)
    expect(averageNeighbourGreen).toEqual(56)

    expect(averageNeighbourBlue).not.toEqual(blue)
    expect(averageNeighbourBlue).toEqual(85)
  })


  it('can perform a basic blur on an image', () => {
    const blurredImageData = basicBlur(rawImageData)
    const dataInDecimal = imageDataToDecimalArry(rawImageData.data)

    expect(blurredImageData).not.toEqual(dataInDecimal);

    expect(blurredImageData).toEqual(new Uint8ClampedArray([
      223, 32, 64, 255, 234, 85, 43, 255, 255, 127, 0, 255,
      170, 21, 127, 255, 198, 56, 85, 255, 234, 85, 43, 255,
      128, 0, 191, 255, 170, 21, 127, 255, 223, 32, 64, 255,
    ]))
  })
})
