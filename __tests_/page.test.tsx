import { useRouter } from 'next/router'
import { http, HttpResponse } from 'msw'
import {setupServer} from 'msw/node'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import mockRouter from 'next-router-mock';

import Home from '../src/app/page'
import testData from './image-test-data';

const testApiURL = 'https://picsum.photos/v2/list';

jest.mock("next/navigation", () => ({
  useRouter,
  usePathname: jest.fn().mockReturnValue('/[page]'),
}));
jest.mock('next/router', () => jest.requireActual('next-router-mock'))

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

  it('correctly calls Next router when `onNavClick()` is called by an event with target `value` attribute', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const nextButton = await screen.findByRole('button', { name: /Next page/ });

    expect(nextButton.getAttribute('value')).toEqual('2')

    await user.click(nextButton)

    expect(mockRouter).toMatchObject({
      asPath: "/",
      pathname: "/2",
      query: {},
    });
  })
})
