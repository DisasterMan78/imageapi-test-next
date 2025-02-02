import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ImageGrid from '../../src/app/components/image-grid'
import testData from '../image-test-data'

const imageGridProps = {
  imageData: testData,
  thumbnailWidth: 300,
  thumbnailHeight: 200,
  page: 1,
  onNavClick: jest.fn(() => {}),
}

describe('ImageGrid', () => {

  it('displays one image for each item in the API data', () => {
    render(<ImageGrid { ...imageGridProps} />)
    const images = screen.getAllByRole('img')

    expect(images.length).toEqual(testData.length)
  })

  it('displays author name for each image', () => {
    render(<ImageGrid { ...imageGridProps} />)

    const items = screen.getAllByRole('listitem')

    items.forEach((item, index) => {
      expect(item).toHaveTextContent(testData[index].author)
    })

  })

  it('displays onluy a "Next page" button on page 1', () => {
    render(<ImageGrid { ...imageGridProps} />)

    const nav = screen.getByRole('navigation');
    const buttons = within(nav).getAllByRole('button')

    expect(buttons.length).toEqual(1)
    expect(buttons[0]).toHaveTextContent("Next page")
  })

  it('should triggers API request for page 2 when "Next page" button is clicked', async () => {
    const user = userEvent.setup()
    render(<ImageGrid { ...imageGridProps} />)

    const nextButton = screen.getByRole('button', { name: /Next page/ });
    expect(nextButton.getAttribute('value')).toEqual('2')
    await user.click(nextButton)

    expect(imageGridProps.onNavClick).toHaveBeenCalled()
  })
})
