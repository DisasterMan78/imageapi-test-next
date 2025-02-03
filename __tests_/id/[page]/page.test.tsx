import { http, HttpResponse } from 'msw'
import {setupServer} from 'msw/node'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import ImageEditor from '@/app/id/[image]/page'
import testData from '../../image-test-data'

const testApiURL = 'https://picsum.photos/id/undefined/info'

jest.mock("next/navigation", () => ({
  useParams: () => ({
    get: () => {}
  }),
}));

const server = setupServer(
  http.get(testApiURL, () => {
    return HttpResponse.json(testData[0])
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Home', () => {
  it('renders a heading', () => {
    render(<ImageEditor />)

    const heading = screen.getByRole('heading', { level: 1 })

    expect(heading).toHaveTextContent('Snowplow test - Edit Image')
  })

  it('shows loading before image data received', () => {
    render(<ImageEditor />)

    const loading = screen.getAllByRole('progressbar')[0]

    expect(loading).toHaveTextContent('Loading image')
  })

  it('displays an error if API call fails', async () => {
    server.use(
      http.get(testApiURL, () => {
        return new HttpResponse(null, {status: 500})
      }),
    )

    render(<ImageEditor />)

    const error = await screen.findByText('Failed to fetch data')

    expect(error).toBeInTheDocument();
  })

  it('renders image', async () => {
    render(<ImageEditor />)
    const container = await screen.findByTestId('image-original')

    expect(container).toBeInTheDocument()
  })
})
