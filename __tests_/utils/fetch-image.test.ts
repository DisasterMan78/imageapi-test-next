import { http, HttpResponse } from 'msw'
import '@testing-library/jest-dom'

import FetchImageOnClient from '@/app/utils/fetch-image'
import { server, testImageAPIURL, testJPGResponse } from '../mocks/msw.mock'

describe('api fetch tests', () => {
  it('receives data from API on success', async () => {
    const result = await FetchImageOnClient(testImageAPIURL)
    const testBlob = new Blob([new Uint8Array(testJPGResponse)], {type: 'image/jpeg' });

    expect(result).toMatchObject(testBlob)
  })

  it('handles server error', async () => {
    server.use(
      http.get(testImageAPIURL, () => {
        return new HttpResponse(null, {status: 500})
      }),
    )

    await FetchImageOnClient(testImageAPIURL)
      .catch(error => {
        expect(error.message).toEqual('Failed to fetch image: 500 - Internal Server Error - ')
      })
  })
})
