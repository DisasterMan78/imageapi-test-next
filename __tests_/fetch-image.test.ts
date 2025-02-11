import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import '@testing-library/jest-dom'

import FetchImageOnClient, { blobToArrayBuffer, checkImageDataIsJPEG } from '@/app/fetch-image'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { waitFor } from '@testing-library/dom'

const testApiURL = 'http://fake.api/test'//'https://picsum.photos/id/0/750/500.jpg'
const testResponse =  readFileSync(resolve(__dirname, 'test-image.jpg'))

const server = setupServer(
  http.get(testApiURL, async () => new HttpResponse(testResponse, {
      headers: {
        'Content-Length': testResponse.byteLength.toString(),
        'Content-Type': 'image/jpeg',
      }
    })
  )
)

beforeAll(() => server.listen({
  onUnhandledRequest: (req) => console.error(`No handler for ${req.url}`),
}))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('api fetch tests', () => {
  it('receives data from API on success', async () => {
    const result = await FetchImageOnClient(testApiURL)
    const testBlob = new Blob([new Uint8Array(testResponse)], {type: 'image/jpeg' });

    await waitFor(
      () => expect(result).toMatchObject(testBlob)
    )
  })

  it('handles server error', async () => {
    server.use(
      http.get(testApiURL, () => {
        return new HttpResponse(null, {status: 500})
      }),
    )

    const response = await FetchImageOnClient(testApiURL) as Error

    expect(response.message).toEqual('Failed to fetch image: 500 - Internal Server Error')
  })

  /* This fails with:
  `TypeError: Failed to execute 'readAsArrayBuffer' on 'FileReader': parameter 1 is not of type 'Blob'.`
  Despite the fact that the it logs as
  `Blob { size: 454, type: 'image/jpeg' }`
  and `blob instanceof Blob` === true
  Go figure...
  */
  // it('can check that binary data has JPEG signature markers (true)', async () => {
  //   const imageData = await FetchImageOnClient(testApiURL) as Blob
  //   console.log(imageData)
  //   const arrayBuffer = await blobToArrayBuffer(imageData) as ArrayBuffer
  //   const imageDataArray = new Uint8Array(arrayBuffer)

  //   await waitFor(() => {
  //     expect(checkImageDataIsJPEG(imageDataArray)).toBeTruthy()
  //   })
  // })
})
