import { http, HttpResponse } from 'msw'
import '@testing-library/jest-dom'

import FetchImageOnClient from '@/app/fetch-image'
import { waitFor } from '@testing-library/dom'
import { server, testAPIURL, testJPGResponse } from './mocks/msw'

describe('api fetch tests', () => {
  it('receives data from API on success', async () => {
    const result = await FetchImageOnClient(testAPIURL)
    const testBlob = new Blob([new Uint8Array(testJPGResponse)], {type: 'image/jpeg' });

    await waitFor(
      () => expect(result).toMatchObject(testBlob)
    )
  })

  it('handles server error', async () => {
    server.use(
      http.get(testAPIURL, () => {
        return new HttpResponse(null, {status: 500})
      }),
    )

    const response = await FetchImageOnClient(testAPIURL) as Error

    expect(response.message).toEqual('Failed to fetch image: 500 - Internal Server Error')
  })
})
