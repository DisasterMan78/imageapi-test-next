import { http, HttpResponse } from 'msw'
import {setupServer} from 'msw/node'
import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'

import ImageEditor from '@/app/id/[image]/page'
import testData from '../../image-test-data'
import userEvent from '@testing-library/user-event'

const testApiURL = 'https://picsum.photos/id/undefined/info'

interface HTMLCheckboxElement extends HTMLInputElement {
  type: "checkbox";
}

jest.mock('next/navigation', () => ({
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

  it('renders a "width" input with default value', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const label = within(container).getByLabelText('Width:')
    const input = within(container).getByDisplayValue('750')

    expect(label).toBeInTheDocument()
    expect(input).toBeInTheDocument()

  })

  it('changes the preview image link url on width input change', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-image')
    const input = within(container).getByDisplayValue('750')
    const button = within(container).getByTestId('get-image-button')

    expect(input).toHaveFocus()

    await userEvent.type(input, '0')

    expect(button.getAttribute('href')).toMatch(/\/id\/0\/7500\//)
  })

  it('renders a "height" input with default value', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const label = within(container).getByLabelText('Height:')
    const input = within(container).getByDisplayValue('500')

    expect(label).toBeInTheDocument()
    expect(input).toBeInTheDocument()

  })

  it('changes the preview image link url on height input change', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-image')
    const input = within(container).getByDisplayValue('500')
    const button = within(container).getByTestId('get-image-button')

    await userEvent.type(input, '0')

    expect(button.getAttribute('href')).toMatch(/\/id\/0\/750\/5000/)
  })

  it('renders a "grayscale" checkbox, unchecked', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const label = within(container).getByLabelText('Grayscale:')
    const input = within(container).getByTestId('edit-grayscale')

    expect(label).toBeInTheDocument()
    expect(input.getAttribute('checked')).toEqual(null)

  })

  it('changes the preview image link url on height input change', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-image')
    // const imagePreview = within(container).getByAltText('Edited image preview')
    const input = within(container).getByTestId('edit-grayscale') as HTMLCheckboxElement
    const button = within(container).getByTestId('get-image-button')

    await userEvent.click(input)

    expect(input.checked).toBe(true)
    expect(button.getAttribute('href')).toMatch(/\?grayscale/)
    // Weirdly, while Jest can see the update button URL
    // it's not seeing the update image src?
    // expect(imagePreview.getAttribute('src')).toMatch(/\\%3fgrayscale/)
  })

  it('renders a "blur" number input with default value of 0', async () => {
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-options')
    const label = within(container).getByLabelText('Blur:')
    const input = within(container).getByDisplayValue('0')

    expect(label).toBeInTheDocument()
    expect(input).toBeInTheDocument()

  })

  it('changes the preview image link url on blur input change', async () => {
    const user = userEvent.setup()
    render(<ImageEditor />)

    const container = await screen.findByTestId('edit-image')
    // const imagePreview = within(container).getByAltText('Edited image preview')
    const input = within(container).getByDisplayValue('0')
    const button = within(container).getByTestId('get-image-button')

    await user.tripleClick(input)
    await userEvent.type(input, '9')

    expect(button.getAttribute('href')).toMatch(/\&blur=9/)
    // Weirdly, while Jest can see the update button URL
    // it's not seeing the update image src?
    // expect(imagePreview.getAttribute('src')).toMatch(/\\%26blur%3D9/)
  })

  it('renders original image at 750 * 500px', async () => {
    render(<ImageEditor />)
    const image = await screen.findByTestId('image-original')

    expect(image).toBeInTheDocument()
    expect(image.getAttribute('width')).toEqual('750')
    expect(image.getAttribute('height')).toEqual('500')
  })
})
