import { useRouter } from 'next/router'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import Page from '@/app/[page]/page'

jest.mock("next/navigation", () => ({
  useRouter,
  useParams: () => ({
    get: () => {}
  }),
  usePathname: jest.fn().mockReturnValue('/[page]'),
}));
jest.mock('next/router', () => jest.requireActual('next-router-mock'))

describe('Browser page', () => {
  it('renders a heading', () => {
    render(<Page />)

    const heading = screen.getByRole('heading', { level: 1 })

    expect(heading).toHaveTextContent('Snowplow test - Picsum API')
  })
})