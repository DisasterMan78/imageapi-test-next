/**
 * @jest-environment node
 */
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

})
