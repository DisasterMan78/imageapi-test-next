
import '@testing-library/jest-dom'

import FetchImageOnClient from '@/app/fetch-image'
import { waitFor } from '@testing-library/dom'
import { checkImageDataIsJPEG, convertImageDataToGrayscale, convertToGrayscale, getImageDataBuffer, imageDataToPixelMatrix, invertImageData, invertPixelColour, locateSOSinImage, RGBAArray } from '@/app/utils/image-processing'
import { pngAPIURL, testAPIURL, testSmallJPGURL, testTinyJPGURL } from '../mocks/msw.mock'
import { decode, RawImageData } from 'jpeg-js'
import invertedSpectrumImageData from '../mocks/inverted-spectrum-image-data.mock'
import grayscaleSpectrumImageData from '../mocks/grayscale-spectrum-image-data.mock'

describe('api fetch tests', () => {
  it ('can get the image data buffer as a Uint8Array', async () => {
    const imageData = await FetchImageOnClient(testAPIURL) as Blob
    const imageDataArray = await getImageDataBuffer(imageData)

    expect(imageDataArray instanceof Uint8Array).toBeTruthy()
  })

  it('can check that binary data has JPEG signature markers (true)', async () => {
    const imageData = await FetchImageOnClient(testAPIURL) as Blob
    const imageDataArray = await getImageDataBuffer(imageData)

    await waitFor(() => {
      expect(checkImageDataIsJPEG(imageDataArray)).toBeTruthy()
    })
  })

  it('can check that binary data has JPEG signature markers (false)', async () => {
    const imageData = await FetchImageOnClient(pngAPIURL) as Blob
    const imageDataArray = await getImageDataBuffer(imageData)

    await waitFor(() => {
      expect(checkImageDataIsJPEG(imageDataArray)).toBeFalsy()
    })
  })

  it('can find Start of Scan signature in image data', async () => {
    const imageData = await FetchImageOnClient(testAPIURL) as Blob
    const imageDataArray = await getImageDataBuffer(imageData)
    const sosPosition = locateSOSinImage(imageDataArray);

    expect(sosPosition).toEqual(49412)
  })

  it('can convert an RGBA colour to grayscale', () => {
    const colourArray = [8, 132, 160, 255] as unknown as RGBAArray;
    const grayscaleArray = convertToGrayscale(colourArray)

    expect(grayscaleArray).toEqual([98, 98, 98, 255])
  })

  it('can convert an RGB image to grayscale', async () => {
    const imageData = await FetchImageOnClient(testSmallJPGURL) as Blob
    const imageDataArray = await getImageDataBuffer(imageData)
    const rawImageData = decode(imageDataArray) as RawImageData<Buffer>
    const convertedPixelData = convertImageDataToGrayscale(rawImageData);

    expect(convertedPixelData).toEqual(grayscaleSpectrumImageData)


  })

  it('can invert an RGBA colour', () => {
    const colourArray = [8, 132, 160, 255] as unknown as RGBAArray;
    const grayscaleArray = invertPixelColour(colourArray)

    expect(grayscaleArray).toEqual([247, 123, 95, 255])
  })

  it('can invert an RGB image', async () => {
    const imageData = await FetchImageOnClient(testSmallJPGURL) as Blob
    const imageDataArray = await getImageDataBuffer(imageData)
    const rawImageData = decode(imageDataArray) as RawImageData<Buffer>
    const convertedPixelData = invertImageData(rawImageData);

    // console.dir(convertedPixelData, { 'maxArrayLength': null})

    expect(convertedPixelData).toEqual(invertedSpectrumImageData)


  })

  it('can convert image data to a 2 dimensional array of pixel data arrays', async () => {
    const imageData = await FetchImageOnClient(testTinyJPGURL) as Blob
    const imageDataArray = await getImageDataBuffer(imageData)
    const rawImageData = decode(imageDataArray) as RawImageData<Buffer>
    const pixelMatrix = imageDataToPixelMatrix(rawImageData)

    console.dir(pixelMatrix, {'maxArrayLength': null})
  })
})