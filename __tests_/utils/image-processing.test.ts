import '@testing-library/jest-dom'
import { waitFor } from '@testing-library/dom'
import { decode, RawImageData } from 'jpeg-js'

import FetchImageOnClient from '@/app/fetch-image'
import { averageNeighbourByChannel, checkImageDataIsJPEG, convertImageDataToGrayscale, convertToGrayscale,  getImageDataBuffer, imageDataToPixelMatrix, invertImageData, invertPixelColour, locateSOSinImage, RGBAArray } from '@/app/utils/image-processing'
import { pngAPIURL, testTinyJPGURL } from '../mocks/msw.mock'

let testImageData: Blob,
  testImageDataArray: Uint8Array<ArrayBuffer>,
  rawImageData: RawImageData<Buffer>

beforeEach(async () => {
  testImageData = await FetchImageOnClient(testTinyJPGURL) as Blob
  testImageDataArray = await getImageDataBuffer(testImageData)
  rawImageData = decode(testImageDataArray)
})


describe('api fetch tests', () => {
  it ('can get the image data buffer as a Uint8Array', async () => {
    expect(testImageDataArray instanceof Uint8Array).toBeTruthy()
  })

  it('can check that binary data has JPEG signature markers (true)', async () => {
    await waitFor(() => {
      expect(checkImageDataIsJPEG(testImageDataArray)).toBeTruthy()
    })
  })

  it('can check that binary data has JPEG signature markers (false)', async () => {
    const pngImageData = await FetchImageOnClient(pngAPIURL) as Blob
    const imageDataArray = await getImageDataBuffer(pngImageData)

    await waitFor(() => {
      expect(checkImageDataIsJPEG(imageDataArray)).toBeFalsy()
    })
  })

  it('can find Start of Scan signature in image data', async () => {
    const sosPosition = locateSOSinImage(testImageDataArray);

    expect(sosPosition).toEqual(3704)
  })

  it('can convert an RGBA colour to grayscale', () => {
    const colourArray = [8, 132, 160, 255] as unknown as RGBAArray;
    const grayscaleArray = convertToGrayscale(colourArray)

    expect(grayscaleArray).toEqual([98, 98, 98, 255])
  })

  it('can convert an RGB image to grayscale', async () => {
    const convertedPixelData = convertImageDataToGrayscale(rawImageData);

    expect(convertedPixelData).toEqual(grayscaleSpectrumImageData)
  })

  it('can invert an RGBA colour', () => {
    const colourArray = [8, 132, 160, 255] as unknown as RGBAArray;
    const grayscaleArray = invertPixelColour(colourArray)

    expect(grayscaleArray).toEqual([247, 123, 95, 255])
  })

  it('can invert an RGB image', async () => {
    const convertedPixelData = invertImageData(rawImageData);

    expect(convertedPixelData).toEqual(invertedSpectrumImageData)
  })

  it('can convert image data to a 2 dimensional array of pixel data arrays', async () => {
    const pixelMatrix = imageDataToPixelMatrix(rawImageData)

    expect(pixelMatrix).toEqual([
      [
        [254,   0,   0, 255],
        [255, 128,   0, 255],
        [255, 254,   0, 255],
      ],
      [
        [128,   0, 255, 255],
        [254,   0,   0, 255],
        [255, 126,   0, 255],
      ],
      [
        [  0,   0, 254, 255],
        [128,   0, 255, 255],
        [254,   0,   0, 255],
      ]
    ])
  })

  it('can calculate the average value of each colour channel from the 8 pixels around a given pixel in some image data', async () => {
    const pixelMatrix = imageDataToPixelMatrix(rawImageData);

    const averageNeighbourRed = averageNeighbourByChannel(pixelMatrix, 1, 1, 0)
    const averageNeighbourGreen = averageNeighbourByChannel(pixelMatrix, 1, 1, 1)
    const averageNeighbourBlue = averageNeighbourByChannel(pixelMatrix, 1, 1, 2)

    expect(averageNeighbourRed).toEqual(241)
    expect(averageNeighbourGreen).toEqual(99)
    expect(averageNeighbourBlue).toEqual(28)
  })
})