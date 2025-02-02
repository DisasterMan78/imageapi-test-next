import {http, HttpResponse} from 'msw'
import {setupServer} from 'msw/node'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import Home from '../src/app/page'

const testApiURL = 'https://picsum.photos/v2/list';
const testResponse = [
  {
    "id": "0",
    "author": "Alejandro Escamilla",
    "width": 5000,
    "height": 3333,
    "url": "https://unsplash.com/photos/yC-Yzbqy7PY",
    "download_url": "https://picsum.photos/id/0/5000/3333"
  },
];
const server = setupServer(
  http.get(testApiURL, () => {
    return HttpResponse.json(testResponse)
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', { level: 1 })

    expect(heading).toHaveTextContent('Snowplow test - Picsum API')
  })

  it('receives image data from Picsum API', async () => {
    const data = await screen.getByTestId('picsum-result');

    expect(data).toHaveTextContent(/Alejandro Escamilla/)
  })
})
