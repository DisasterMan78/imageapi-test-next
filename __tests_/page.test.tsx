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
  {
    "id": "1",
    "author": "Alejandro Escamilla",
    "width": 5000,
    "height": 3333,
    "url": "https://unsplash.com/photos/LNRyGwIJr5c",
    "download_url": "https://picsum.photos/id/1/5000/3333"
  },
  {
    "id": "2",
    "author": "Alejandro Escamilla",
    "width": 5000,
    "height": 3333,
    "url": "https://unsplash.com/photos/N7XodRrbzS0",
    "download_url": "https://picsum.photos/id/2/5000/3333"
  },
  {
    "id": "3",
    "author": "Alejandro Escamilla",
    "width": 5000,
    "height": 3333,
    "url": "https://unsplash.com/photos/Dl6jeyfihLk",
    "download_url": "https://picsum.photos/id/3/5000/3333"
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

  it('shows loading before image data received', () => {
    render(<Home />)

    const loading = screen.getByRole('progressbar')

    expect(loading).toHaveTextContent('Loading images')
  })

  it('displays one image for each item in the API data', async () => {
    render(<Home />)
    const container = screen.getByTestId('picsum-result')
    const images = await screen.findAllByRole('img');

    expect(images.length).toEqual(testResponse.length)
  })


  it('displays author name for each image', async () => {
    render(<Home />)
    const container = screen.getByTestId('picsum-result')
    const items = await screen.findAllByRole('listitem');

    items.forEach((item, index) => {
      expect(item).toHaveTextContent(testResponse[index].author)
    })

  })
})
