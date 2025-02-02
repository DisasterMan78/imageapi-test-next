import {http, HttpResponse} from 'msw'
import {setupServer} from 'msw/node'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import Home from '../src/app/page'
import testData from './image-test-data';

const testApiURL = 'https://picsum.photos/v2/list';

const server = setupServer(
  http.get(testApiURL, () => {
    return HttpResponse.json(testData)
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

    const loading = screen.getAllByRole('progressbar')[0]

    expect(loading).toHaveTextContent('Loading images')
  })

  it('displays an error if API call fails', async () => {
    server.use(
      http.get(testApiURL, () => {
        return new HttpResponse(null, {status: 500})
      }),
    )

    render(<Home />)

    const error = await screen.findByText('Failed to fetch data')

    expect(error).toBeInTheDocument();
  })

  it('renders image grid', async () => {
    render(<Home />)
    const container = await screen.findByTestId('image-grid')

    expect(container).toBeInTheDocument()
  })
})
