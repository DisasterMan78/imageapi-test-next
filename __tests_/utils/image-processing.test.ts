
import '@testing-library/jest-dom'

import FetchImageOnClient from '@/app/fetch-image'
import { waitFor } from '@testing-library/dom'
import { checkImageDataIsJPEG, getImageDataBuffer } from '@/app/utils/image-processing'
import { pngAPIURL, testAPIURL } from '../mocks/msw'

describe('api fetch tests', () => {
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
})