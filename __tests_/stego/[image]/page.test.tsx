import { http, HttpResponse } from 'msw'
import {setupServer} from 'msw/node'
import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'

import ImageEditor, { editorDefaults } from '@/app/stego/[image]/page'
import testData from '../../mocks/image-test-data.mock'
import userEvent from '@testing-library/user-event'

const testApiURL = 'https://picsum.photos/id/0/info'

type LocalStorageImages = {
  [key: string]: string;
};

jest.mock('next/navigation', () => ({
  useParams: () => ({
    image: 0
  }),
}));

const mockLocalStorage = (() => {
  const store = {} as LocalStorageImages;

  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),

    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),

    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

const server = setupServer(
  http.get(testApiURL, () => {
    return HttpResponse.json(testData[0])
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.removeItem('image-id-0')
  })


  it('renders a heading', () => {
    render(<ImageEditor />)

    const heading = screen.getByRole('heading', { level: 1 })

    expect(heading).toHaveTextContent('Picsum API test - Edit Image')
  })


  it('shows loading before image data received', async () => {
    render(<ImageEditor />)

    const loading = await screen.findByRole('progressbar', { name: /Loading image/ })

    expect(loading).toBeInTheDocument()
  })


  it('displays an error if the API call fails', async () => {
    server.use(
      http.get(testApiURL, () => {
        return new HttpResponse(null, {status: 500})
      }),
    )

    render(<ImageEditor />)

    const error = await screen.findByText(/Failed to fetch data/)

    expect(error).toBeInTheDocument();
  })

  it('renders a "width" input with label and default value', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const input = within(container).getByLabelText('Width:') as HTMLInputElement

    expect(input).toBeInTheDocument()
    expect(input.tagName).toEqual('INPUT')
    expect(input.value).toEqual("750")
  })


  it('width input change: changes the preview image link url and updates localStorage', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-image')
    const input = within(container).getByDisplayValue('750')
    const anchor = within(container).getByTestId('get-image-link') as HTMLAnchorElement

    expect(input).toHaveFocus()

    await userEvent.type(input, '0')

    expect(anchor.href).toMatch(/\/id\/0\/7500\//)

    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('image-id-0', JSON.stringify({
      ...editorDefaults,
      width: 7500,
    }))
  })


  it('renders a "height" input with default value', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const input = within(container).getByLabelText('Height:') as HTMLInputElement

    expect(input).toBeInTheDocument()
    expect(input.tagName).toEqual('INPUT')
    expect(input.value).toEqual("500")
  })


  it('height input change: changes the preview image link url and updates localStorage', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-image')
    const input = within(container).getByDisplayValue('500')
    const anchor = within(container).getByTestId('get-image-link') as HTMLAnchorElement

    await userEvent.type(input, '0')

    expect(anchor.href).toMatch(/id\/0\/750\/5000/)

    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('image-id-0', JSON.stringify({
      ...editorDefaults,
      height: 5000,
    }))
  })

  it('restores input values from localStorage', async () => {
    const lsValues = {
      width: '567',
      height: '876',
    }

    window.localStorage.getItem = () => JSON.stringify(lsValues);

    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-image')
    const widthInput = within(container).getByLabelText('Width:') as HTMLInputElement
    const heightInput = within(container).getByLabelText('Height:') as HTMLInputElement

    expect(widthInput.value).toEqual(lsValues.width)
    expect(heightInput.value).toEqual(lsValues.height)
  })

  it('has a message to encrypt input', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const input = within(container).getByLabelText('Message to encrypt:')

    expect(input).toBeInTheDocument()
    expect(input.tagName).toEqual('INPUT')
  })

  it('has an characters remaining indicator', async () => {
    const lsValues = {
      width: '567',
      height: '876',
    }

    window.localStorage.getItem = () => JSON.stringify(lsValues);
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const indicator = within(container).getByText('characters available to encrypt', { exact: false })
    const indicatorText = indicator.textContent;

    expect(indicatorText).toEqual('0 / 62086 characters available to encrypt')
  })

  it('updates characters remaining indicator when message to encrypt changes', async () => {
    const lsValues = {
      width: '567',
      height: '876',
    }

    window.localStorage.getItem = () => JSON.stringify(lsValues);
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const input = within(container).getByLabelText('Message to encrypt:')
    const indicator = within(container).getByText('characters available to encrypt', { exact: false })

    await userEvent.type(input, '1234567890')
    const indicatorText = indicator.textContent;

    expect(indicatorText).toEqual('10 / 62086 characters available to encrypt')
  })

  it('has an encrypt data in alpha channel button', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const button = within(container).getByRole('button', {
      name: /Encrypt/
    })

    expect(button).toBeInTheDocument()
  })

  it('displays the image with encrypted data when the encypt data button is clicked', async () => {
    const user = userEvent.setup()
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const button = within(container).getByRole('button', { name: /Encrypt/ }) as HTMLButtonElement

    await user.click(button)

    // expect(onEncryptClick).toHaveBeenCalled()
  })

  // it('has a show encrypted data channel (high contrast) button', () => {
  //   expect(0).toEqual(1)
  // })

  // it('displays the encrypted data channel the show encrypted data channel (high contrast) button is clicked', () => {
  //   expect(0).toEqual(1)
  // })

})
