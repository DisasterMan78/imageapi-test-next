import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ImageGrid from '../../src/app/components/image-grid'
import testData from '../image-test-data'

const imageGridProps = {
  imageData: testData,
  APILimit: 4,
  thumbnailWidth: 300,
  thumbnailHeight: 200,
  page: 1,
  onNavClick: jest.fn(() => { }),
  onImageClick: jest.fn(() => {}),
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ImageGrid', () => {

  it('shows a notice if no image data is received', () => {
    render(<ImageGrid {...{
      ...imageGridProps,
      imageData: [],
    }} />)

    const notice = screen.getByRole('alert')

    expect(notice).toHaveTextContent('No more images to display')
  })

  it('displays one image for each item in the API data', () => {
    render(<ImageGrid { ...imageGridProps} />)
    const images = screen.getAllByRole('img')

    expect(images.length).toEqual(testData.length)
  })

  it('has a button that triggers edit image page, and displays author name for each image', () => {
    const user = userEvent.setup()

    render(<ImageGrid {...{
      ...imageGridProps,
      // Limit data length to make test faster
      imageData: testData.slice(0, 4),
    }} />)

    const items = screen.getAllByRole('listitem')

    items.forEach(async (item, index) => {
      const button = within(item).getByRole('button')
      // console.log(button)
      expect(button).toBeInTheDocument()
      expect(button.getAttribute('value')).toEqual(testData[index].id)
      await user.click(button)

      expect(imageGridProps.onImageClick).toHaveBeenCalled()

      expect(item).toHaveTextContent(testData[index].author)
    })

  })
})
