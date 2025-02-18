import { useRouter } from 'next/router'
import { http, HttpResponse } from 'msw'
import {setupServer} from 'msw/node'
import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import mockRouter from 'next-router-mock';

import Home from '../src/app/page'
import testData from './mocks/image-test-data.mock';

const testApiURL = 'https://picsum.photos/v2/list';

jest.mock('next/navigation', () => ({
  useRouter,
  useParams: () => ({
    get: () => {}
  }),
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

    expect(heading).toHaveTextContent('Picsum API test - Browse Images')
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

    const error = await screen.findByText(/Failed to fetch data/)

    expect(error).toBeInTheDocument();
  })

  it('renders image grid', async () => {
    render(<Home />)
    const container = await screen.findByTestId('image-grid-container')

    expect(container).toBeInTheDocument()
  })

  it('correctly calls Next router when `onNavClick()` is called by an event with target `value` attribute', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const nextButtons = await screen.findAllByRole('button', { name: /Next page/ })
    const firstNextButton = nextButtons[0] as HTMLButtonElement;

    expect(firstNextButton.value).toEqual('2')

    await user.click(firstNextButton)

    expect(mockRouter).toMatchObject({ pathname: '/2' });
  })

  it('correctly calls Next router when `onImageClick()` is called by an event with target `value` attribute', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const imageGrid = await screen.findByTestId('image-grid')
    const imageButtons = within(imageGrid).getAllByRole('button')
    const firstImageButtons = imageButtons[0] as HTMLButtonElement;

    expect(firstImageButtons.value).toEqual('0')

    await user.click(firstImageButtons)

    expect(mockRouter).toMatchObject({ pathname: "/id/0" });
  })
})
