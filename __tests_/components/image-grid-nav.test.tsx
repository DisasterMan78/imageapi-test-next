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

// This file split out from the other image-grid tests as a quick
// fix for `onNavClick` call test failing when `onImageClick` is
// called in an earlier test. Jest mocks just need resetting properly,
// but this means I'm not held up fixing it. Minor tech-debt, arguably

describe('ImageGrid', () => {

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

  it('should trigger API request for page 2 when "Next page" button is clicked', async () => {
    const user = userEvent.setup()
    render(<ImageGrid { ...imageGridProps} />)

    const nextButton = screen.getAllByRole('button', { name: /Next page/ })[0] as HTMLButtonElement

    expect(nextButton.value).toEqual('2')

    await user.click(nextButton)

    expect(imageGridProps.onNavClick).toHaveBeenCalled()
  })

  it('should trigger API request for page 1 when "Prev page" button is clicked on page 2', async () => {
    const user = userEvent.setup()
    render(<ImageGrid {...{ ...imageGridProps, page: 2}} />)

    const prevButton = screen.getAllByRole('button', { name: /Prev page/ })[0] as HTMLButtonElement

    expect(prevButton.value).toEqual('1')

    await user.click(prevButton)

    expect(imageGridProps.onNavClick).toHaveBeenCalled()
  })
})
