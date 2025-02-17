
import '@testing-library/jest-dom'

import FetchImageOnClient from '@/app/fetch-image'
import { waitFor } from '@testing-library/dom'
import { checkImageDataIsJPEG, convertToGrayscale, getImageDataBuffer, invertPixelColour, locateSOSinJPEG, rgbaArray } from '@/app/utils/image-processing'
import { pngAPIURL, testAPIURL } from '../mocks/msw.mock'

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

  it('can find Start of Scan signature in a JPEG', async () => {
    const imageData = await FetchImageOnClient(pngAPIURL) as Blob
    const imageDataArray = await getImageDataBuffer(imageData)
    const sosPosition = locateSOSinJPEG(imageDataArray);

    expect(sosPosition).toEqual(560002)
  })

  it('can convert an RGBA colour to grayscale', () => {
    const colourArray = [8, 132, 160, 255] as unknown as rgbaArray;
    const grayscaleArray = convertToGrayscale(colourArray)

    expect(grayscaleArray).toEqual([98, 98, 98, 255])
  })

  it('can invert an RGBA colour', () => {
    const colourArray = [8, 132, 160, 255] as unknown as rgbaArray;
    const grayscaleArray = invertPixelColour(colourArray)

    expect(grayscaleArray).toEqual([247, 123, 95, 255])
  })
})