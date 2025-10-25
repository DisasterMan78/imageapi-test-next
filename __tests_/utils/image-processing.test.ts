import '@testing-library/jest-dom'

import { decode, RawImageData } from 'jpeg-js'

import FetchImageOnClient from '@/app/utils/fetch-image'
import {
  checkImageDataIsJPEG,
  convertAlphaChannelToImage,
  convertImageDataToGrayscale,
  convertPixelToGrayscale,
  fetchAndDecodeToImageData,
  gaussianMapImageData,
  getImageDataBuffer,
  imageDataToPixelMatrix,
  invertImageData,
  invertPixelColour,
  locateSOSinImage,
  RGBAArray
} from '@/app/utils/image-processing'
import { pngAlphaAPIURL, pngAPIURL, testTinyJPGURL } from '../mocks/msw.mock'

let testImageData: Blob
let testImageDataArray: Uint8Array<ArrayBuffer>
let rawImageData: RawImageData<Buffer>

beforeEach(async () => {
  testImageData = await FetchImageOnClient(testTinyJPGURL) as Blob
  testImageDataArray = await getImageDataBuffer(testImageData)
  rawImageData = decode(testImageDataArray)
})

describe('Image fetch and decode tests', () => {
  it('fetch an image and return the decoded data ', async () => {
    const fetchedData = await fetchAndDecodeToImageData(testTinyJPGURL)

    // This seems wrong - fetchAndDecodeToImageData() does exactly the
    // same as the beforeEach(), so we aren't really testing properly,
    // but it will fail if fetchAndDecodeToImageData() is changed so I
    // feel it still has value
    expect(fetchedData).toEqual(rawImageData)
  })
})

describe('Image processing tests', () => {
  it ('can get the image data buffer as a Uint8Array', async () => {
    expect(testImageDataArray instanceof Uint8Array).toBeTruthy()
  })


  it('can check that binary data has JPEG signature markers (true)', async () => {
    expect(checkImageDataIsJPEG(testImageDataArray)).toBeTruthy()
  })


  it('can check that binary data has JPEG signature markers (false)', async () => {
    const pngImageData = await FetchImageOnClient(pngAPIURL) as Blob
    const imageDataArray = await getImageDataBuffer(pngImageData)

    expect(checkImageDataIsJPEG(imageDataArray)).toBeFalsy()
  })


  it('can find Start of Scan signature in image data', async () => {
    const sosPosition = locateSOSinImage(testImageDataArray);

    expect(sosPosition).toEqual(544)
  })


  it('can convert an RGBA colour to grayscale', () => {
    const colourArray = [8, 132, 160, 255] as unknown as RGBAArray;
    const grayscaleArray = convertPixelToGrayscale(colourArray)

    expect(grayscaleArray).toEqual([98, 98, 98, 255])
  })


  it('can convert an RGB image to grayscale', async () => {
    const convertedPixelData = convertImageDataToGrayscale(rawImageData);

    expect(convertedPixelData).toEqual(new Uint8ClampedArray([
       76,  76,  76, 255, 150, 150, 150, 256, 226, 226, 226, 255,
       67,  67,  67, 255,  76,  76,  76, 255, 150, 150, 150, 255,
       29,  29,  29, 255,  67,  67,  67, 255,  76,  76,  76, 255,
    ]))
  })


  it('can invert an RGBA colour', () => {
    const colourArray = [8, 132, 160, 255] as unknown as RGBAArray;
    const grayscaleArray = invertPixelColour(colourArray)

    expect(grayscaleArray).toEqual([247, 123, 95, 255])
  })


  it('can invert an RGB image', async () => {
    const convertedPixelData = invertImageData(rawImageData);

    expect(convertedPixelData).toEqual(new Uint8ClampedArray([
        1, 255, 255, 255,   1, 128, 255, 255,  1,   0, 255, 255,
      128, 255,   1, 255,   1, 255, 255, 255,  1, 128, 255, 255,
      255, 255,   1, 255, 128, 255,   1, 255,  1, 255, 255, 255,
    ]))
  })


  it('can convert image data to a 2 dimensional array of pixel data arrays', async () => {
    const pixelMatrix = imageDataToPixelMatrix(rawImageData)

    expect(pixelMatrix).toEqual([
      [[254,   0,   0, 255], [254, 127,   0, 255], [254, 255,   0, 255]],
      [[127,   0, 254, 255], [254,   0,   0, 255], [254, 127,   0, 255]],
      [[  0,   0, 254, 255], [127,   0, 254, 255], [254,   0,   0, 255]],
    ])
  })


  it('can generate imageData that maps the output of the gaussian function', () => {
    const data = gaussianMapImageData(5, 5)

    expect(data).toEqual(new Uint8ClampedArray([
        5,   5,   5, 255,  21,  21,  21, 255,  35,  35,  35, 255,  21,  21,  21, 255,   5,   5,   5, 255,
       21,  21,  21, 255,  94,  94,  94, 255, 155, 155, 155, 255,  94,  94,  94, 255,  21,  21,  21, 255,
       35,  35,  35, 255, 155, 155, 155, 255, 255, 255, 255, 255, 155, 155, 155, 255,  35,  35,  35, 255,
       21,  21,  21, 255,  94,  94,  94, 255, 155, 155, 155, 255,  94,  94,  94, 255,  21,  21,  21, 255,
        5,   5,   5, 255,  21,  21,  21, 255,  35,  35,  35, 255,  21,  21,  21, 255,   5,   5,   5, 255
    ]))
  })
})

it('can convert an image to its alpha channel as RGB', async () => {
  const pngImageData = await fetchAndDecodeToImageData(pngAlphaAPIURL) as RawImageData<Buffer>

  const alphaChannelImage = convertAlphaChannelToImage(pngImageData)
})
