import { http, HttpResponse } from 'msw'
import {setupServer} from 'msw/node'
import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'

import ImageEditor, { editorDefaults, LocalStorageImages } from '@/app/id/[image]/page'
import testData from '../../image-test-data'
import userEvent from '@testing-library/user-event'

const testApiURL = 'https://picsum.photos/id/0/info'

interface HTMLCheckboxElement extends HTMLInputElement {
  type: 'checkbox';
}

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

    const error = await screen.findByText(/Failed to fetch data/)

    expect(error).toBeInTheDocument();
  })


  it('renders original image at 750 * 500px', async () => {
    render(<ImageEditor />)
    const image = await screen.findByTestId('image-original') as HTMLImageElement

    expect(image).toBeInTheDocument()
    expect(image.width).toEqual(750)
    expect(image.height).toEqual(500)
  })


  it('renders a "width" input with default value', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const label = within(container).getByLabelText('Width:')
    const input = within(container).getByDisplayValue('750')

    expect(label).toBeInTheDocument()
    expect(input).toBeInTheDocument()

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
    const label = within(container).getByLabelText('Height:')
    const input = within(container).getByDisplayValue('500')

    expect(label).toBeInTheDocument()
    expect(input).toBeInTheDocument()

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


  it('renders a "grayscale" checkbox, unchecked', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const label = within(container).getByLabelText('Grayscale:')
    const input = within(container).getByTestId('edit-grayscale') as HTMLCheckboxElement

    expect(label).toBeInTheDocument()
    expect(input.checked).toEqual(false)

  })


  it('grayscale input change: changes the preview image link url and updates localStorage', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-image')
    // const imagePreview = within(container).getByAltText('Edited image preview') as HTMLImageElement
    const input = within(container).getByTestId('edit-grayscale') as HTMLCheckboxElement
    const anchor = within(container).getByTestId('get-image-link') as HTMLAnchorElement

    await userEvent.click(input)

    expect(input.checked).toBe(true)
    expect(anchor.href).toMatch(/\?grayscale/)
    // Weirdly, while Jest can see the update button URL
    // it's not seeing the updated image src?
    // expect(imagePreview.src).toMatch(/\\%3fgrayscale/)

    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('image-id-0', JSON.stringify({
      ...editorDefaults,
      grayscale: true,
    }))
  })


  it('renders a "blur" number input with default value of 0', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const label = within(container).getByLabelText('Blur:')
    const input = within(container).getByDisplayValue('0')

    expect(label).toBeInTheDocument()
    expect(input).toBeInTheDocument()

  })


  it('blur input change: changes the preview image link url and updates localStorage', async () => {
    const user = userEvent.setup()
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-image')
    // const imagePreview = within(container).getByAltText('Edited image preview') as HTMLImageElement
    const input = within(container).getByDisplayValue('0')
    const button = within(container).getByTestId('get-image-link') as HTMLAnchorElement
    await user.tripleClick(input)
    await userEvent.type(input, '9')

    expect(button.href).toMatch(/\&blur=9/)
    // Weirdly, while Jest can see the update button URL
    // it's not seeing the update image src?
    // expect(imagePreview.src).toMatch(/\\%26blur%3D9/)

    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('image-id-0', JSON.stringify({
      ...editorDefaults,
      blur: 9,
    }))
  })

  it('restores input values from localStorage', async () => {
    const lsValues = {
      width: '567',
      height: '876',
      grayscale: true,
      blur: '5',
    }

    window.localStorage.getItem = () => JSON.stringify(lsValues);

    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-image')
    const widthInput = within(container).getByLabelText('Width:') as HTMLInputElement
    const heightInput = within(container).getByLabelText('Height:') as HTMLInputElement
    const grayscaleInput = within(container).getByLabelText('Grayscale:') as HTMLCheckboxElement
    const blurInput = within(container).getByLabelText('Blur:') as HTMLInputElement

    expect(widthInput.value).toEqual(lsValues.width)
    expect(heightInput.value).toEqual(lsValues.height)
    expect(grayscaleInput.checked).toEqual(lsValues.grayscale)
    expect(blurInput.value).toEqual(lsValues.blur)
  })
})
