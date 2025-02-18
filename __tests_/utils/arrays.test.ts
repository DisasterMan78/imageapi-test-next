import { reverseArray, reverse2dArrayColumns, rotate2dArray, join2dArraysHorizontally, join2dArrayQuarters } from '@/app/utils/arrays'
import '@testing-library/jest-dom'

describe('array utilities', () => {
  it('can reverse an array', async () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const flippedArray = reverseArray(array);

    expect(flippedArray).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
  })

  it('can reverse the columns of a 2d array', async () => {
    const array = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]
    const flippedArray = reverse2dArrayColumns(array);

    expect(flippedArray).toEqual([
      [3, 2, 1],
      [6, 5, 4],
      [9, 8, 7],
    ])
  })

  it('can rotate a 2d array', async () => {
    const array = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]
    const flippedArray = rotate2dArray(array);

    expect(flippedArray).toEqual([
      [9, 8, 7],
      [6, 5, 4],
      [3, 2, 1],
    ])
  })

  it('can join two 2d arrays horizontally', () => {
    const array1 = [
      [ 1,  2,  3],
      [ 7,  8,  9],
      [13, 14, 15],
    ]
    const array2 = [
      [ 4,  5,  6],
      [10, 11, 12],
      [16, 17, 18],
    ]

    const joinedArray = join2dArraysHorizontally(array1, array2);

    expect(joinedArray).toEqual([
      [ 1,  2,  3,  4,  5,  6],
      [ 7,  8,  9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18],
    ])
  })

  it('can join four arrays into single 2x2 array', () => {
    const array1 =[
      [ 1,  2,  3],
      [ 7,  8,  9],
      [13, 14, 15],
    ]
    const array2 = [
      [ 4,  5,  6],
      [10, 11, 12],
      [16, 17, 18],
    ]
    const array3 = [
      [19, 20, 21],
      [25, 26, 27],
      [31, 32, 33],
    ]
    const array4 = [
      [22, 23, 24],
      [28, 29, 30],
      [34, 35, 36],
    ]

    const joinedArray = join2dArrayQuarters(array1, array2, array3, array4);

    expect(joinedArray).toEqual([
      [ 1,  2,  3,  4,  5,  6],
      [ 7,  8,  9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18],
      [19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, 30],
      [31, 32, 33, 34, 35, 36],
    ])
  })
})
