import '@testing-library/jest-dom'

import FetchApiOnClient from '../src/app/fetch-api';

const testApiURL = 'http://fake.api/test';
const testResponse = { someKey: 'Some string data' }

describe('api fetch tests', () => {
  it('receives data from API on success', async () => {
    const result = await FetchApiOnClient(testApiURL)

    expect(result).toMatchObject(testResponse)
  })

})
