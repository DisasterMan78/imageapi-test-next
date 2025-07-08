import '@testing-library/jest-dom'

import { averageByWeight } from '@/app/utils/gaussian-blur'


describe('Gaussian blur processing tests', () => {
  it ('can calculate a weighted difference between two values', async () => {
    expect(averageByWeight(1, 1.2, 0.2)).toEqual(1.04)
  })

})
