import makeGaussian, { gaussianMapData } from '@/app/utils/make-gaussian-matrix';
import '@testing-library/jest-dom'

describe('gaussian matrix tests', () => {
  it('can generate a gaussian function', () => {
    const gaussianFunction = makeGaussian(100, 2.5, 2.55, 3/5, 3/5);
    expect(gaussianFunction(1, 1)).toEqual(0.15619729339126964)
    expect(gaussianFunction(1, 2)).toEqual(2.8864613257207723)
    expect(gaussianFunction(1, 3)).toEqual(3.31653374889103)
    expect(gaussianFunction(1, 4)).toEqual(0.2369351739497266)
    expect(gaussianFunction(1, 5)).toEqual(0.0010524490842709758)
    expect(gaussianFunction(2, 1)).toEqual(2.5121586619366174)
    expect(gaussianFunction(2, 2)).toEqual(46.423652192169065)
    expect(gaussianFunction(2, 3)).toEqual(53.34061048043359)
    expect(gaussianFunction(2, 4)).toEqual(3.81068542631055)
    expect(gaussianFunction(2, 5)).toEqual(0.016926791917422374)
    expect(gaussianFunction(3, 1)).toEqual(2.5121586619366174)
    expect(gaussianFunction(3, 2)).toEqual(46.423652192169065)
    expect(gaussianFunction(3, 3)).toEqual(53.34061048043359)
    expect(gaussianFunction(3, 4)).toEqual(3.81068542631055)
    expect(gaussianFunction(3, 5)).toEqual(0.016926791917422374)
    expect(gaussianFunction(4, 1)).toEqual(0.15619729339126964)
    expect(gaussianFunction(4, 2)).toEqual(2.8864613257207723)
    expect(gaussianFunction(4, 3)).toEqual(3.31653374889103)
    expect(gaussianFunction(4, 4)).toEqual(0.2369351739497266)
    expect(gaussianFunction(4, 5)).toEqual(0.0010524490842709758)
    expect(gaussianFunction(5, 1)).toEqual(0.0006038462622524523)
    expect(gaussianFunction(5, 2)).toEqual(0.01115882897091331)
    expect(gaussianFunction(5, 3)).toEqual(0.012821454613079085)
    expect(gaussianFunction(5, 4)).toEqual(0.0009159724607217414)
    expect(gaussianFunction(5, 5)).toEqual(0.000004068684110652873)
  })

  it('can generate gaussian image map data', () => {
    const gaussianMatrix = gaussianMapData(5, 5)

    expect(gaussianMatrix).toEqual(
    [
        [
          0.492265804738066,
          3.637379646794811,
          9.887422997089114,
          9.887422997089114,
          3.637379646794811,
        ],
        [
          3.637379646794811,
          26.876802263275408,
          73.05872319934849,
          73.05872319934849,
          26.876802263275408,
        ],
        [
          9.887422997089114,
          73.05872319934849,
          198.59419968320825,
          198.59419968320825,
          73.05872319934849,
        ],
        [
          9.887422997089114,
          73.05872319934849,
          198.59419968320825,
          198.59419968320825,
          73.05872319934849,
        ],
        [
          3.637379646794811,
          26.876802263275408,
          73.05872319934849,
          73.05872319934849,
          26.876802263275408,
        ],
      ]
    )
  })
})