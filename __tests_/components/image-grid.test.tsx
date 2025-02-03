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

describe('ImageGrid', () => {

  it('displays one image for each item in the API data', () => {
    render(<ImageGrid { ...imageGridProps} />)
    const images = screen.getAllByRole('img')

    expect(images.length).toEqual(testData.length)
  })

  it('displays author name for each image', () => {
    render(<ImageGrid {...{
      ...imageGridProps,
      // Limit data length to make test faster
      imageData: testData.slice(0, 4),
    }} />)

    const items = screen.getAllByRole('listitem')

    items.forEach((item, index) => {
      expect(item).toHaveTextContent(testData[index].author)
    })

  })

  it('displays only a "Next page" button on page 1', () => {
    render(<ImageGrid { ...imageGridProps} />)

    const nav = screen.getAllByRole('navigation')[0];
    const buttons = within(nav).getAllByRole('button')

    expect(buttons.length).toEqual(1)
    expect(buttons[0]).toHaveTextContent('Next page')
  })

  it('displays both buttons on intermediate page', () => {
    render(<ImageGrid {...{
      ...imageGridProps,
      page: 2,
      APILimit: 30
    }} />)

    const nav = screen.getAllByRole('navigation')[0];
    const buttons = within(nav).getAllByRole('button')

    expect(buttons.length).toEqual(2)
    expect(buttons[0]).toHaveTextContent('Prev page')
    expect(buttons[1]).toHaveTextContent('Next page')
  })

  it('displays only a "Prev page" button on last page', () => {
    render(<ImageGrid {...{
      ...imageGridProps,
      page: 34,
      APILimit: 30,
      imageData: testData.slice(0, 4),
    }} />)

    const nav = screen.getAllByRole('navigation')[0];
    const buttons = within(nav).getAllByRole('button')

    expect(buttons.length).toEqual(1)
    expect(buttons[0]).toHaveTextContent('Prev page')
  })

  it('shows a notice if no image data is received', () => {
    render(<ImageGrid {...{
      ...imageGridProps,
      imageData: [],
    }} />)

    const notice = screen.getByRole('alert')

    expect(notice).toHaveTextContent('No more images to display')
  })

  it('should triggers API request for page 2 when "Next page" button is clicked', async () => {
    const user = userEvent.setup()
    render(<ImageGrid { ...imageGridProps} />)

    const nextButton = screen.getAllByRole('button', { name: /Next page/ })[0];
    expect(nextButton.getAttribute('value')).toEqual('2')
    await user.click(nextButton)

    expect(imageGridProps.onNavClick).toHaveBeenCalled()
  })
})
