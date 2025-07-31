import {http, HttpResponse} from 'msw'
import '@testing-library/jest-dom'

import FetchApiOnClient from '../../src/app/utils/fetch-api';
import { waitFor } from '@testing-library/dom';
import { server, testAPIURL, testAPIResponse } from '../mocks/msw.mock';

describe('api fetch tests', () => {
  it('receives data from API on success', async () => {
    const result = await FetchApiOnClient(testAPIURL)

    await waitFor(
      () => expect(result).toMatch(testAPIResponse)
    )
  })

  it('handles server error', async () => {
    server.use(
      http.get(testAPIURL, () => {
        return new HttpResponse(null, {status: 500})
      }),
    )

    await FetchApiOnClient(testAPIURL)
      .catch(error => {
        expect(error.message).toEqual('Failed to fetch data: 500 - Internal Server Error')
      })
  })
})
