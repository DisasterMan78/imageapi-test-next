import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import ImageGrid from '../../src/app/components/image-grid';
import testData from '../image-test-data';

const imageGridProps = {
  imageData: testData,
  thumbnailWidth: 300,
  thumbnailHeight: 200,
}

describe('ImageGrid', () => {

  it('displays one image for each item in the API data', () => {
    render(<ImageGrid { ...imageGridProps} />)
    const images = screen.getAllByRole('img');

    expect(images.length).toEqual(testData.length)
  })


  it('displays author name for each image', () => {
    render(<ImageGrid { ...imageGridProps} />)

    const items = screen.getAllByRole('listitem');

    items.forEach((item, index) => {
      expect(item).toHaveTextContent(testData[index].author)
    })

  })
})
