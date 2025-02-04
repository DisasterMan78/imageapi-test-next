import {http, HttpResponse} from 'msw'
import {setupServer} from 'msw/node'
import '@testing-library/jest-dom'

import FetchApiOnClient from '../src/app/fetch-api';

const testApiURL = 'http://fake.api/test';
const testResponse = { someKey: 'Some string data' }
const server = setupServer(
  http.get(testApiURL, () => {
    return HttpResponse.json(testResponse)
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('api fetch tests', () => {
  it('receives data from API on success', async () => {
    const result = await FetchApiOnClient(testApiURL)

    expect(result).toMatchObject(testResponse)
  })

  it('handles server error', async () => {
    server.use(
      http.get(testApiURL, () => {
        return new HttpResponse(null, {status: 500})
      }),
    )

    const response = await FetchApiOnClient(testApiURL)

    expect(response.message).toEqual('Failed to fetch data: 500 - Internal Server Error')
  })
})
