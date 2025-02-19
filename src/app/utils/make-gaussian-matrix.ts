type MakeGaussian = (amplitude : number, x0: number, y0: number, sigmaX: number, sigmaY: number) => (x: number, y: number) => number

/**@author https://gist.github.com/uhho
 * @gist https://gist.github.com/uhho/dddd61edc0fdfa1c28e6
 * Two-dimensional Gaussian function
 * @param {number} amplitude
 * @param {number} x0
 * @param {number} y0
 * @param {number} sigmaX
 * @param {number} sigmaY
 * @returns {callback}
 * @callback callback
 * @param {number} u
 * @param {number} v
 * @returns {number}
 */
const  makeGaussian: MakeGaussian = (amplitude, x0, y0, sigmaX, sigmaY) => {
  return function(amplitude : number, x0: number, y0: number, sigmaX: number, sigmaY: number, x: number, y: number):number {
      const exponent = -(
              ( Math.pow(x - x0, 2) / (2 * Math.pow(sigmaX, 2)))
              + ( Math.pow(y - y0, 2) / (2 * Math.pow(sigmaY, 2)))
          );
      return amplitude * Math.pow(Math.E, exponent);
  }.bind(null, amplitude, x0, y0, sigmaX, sigmaY);
}

export const gaussianMapData = (width: number, height: number) => {
  const data: number[][] = [];
  const getGaussianMatrixValue = makeGaussian(255, width / 2, height / 2,  width / 5, height / 5);

  for (let yIndex = 0; yIndex < height; yIndex++) {
    data[yIndex] = [];
    for (let xIndex = 0; xIndex < width; xIndex++) {
      // Adding 0.5 to the coordinates gives us the middle of the
      // pixel, ensuring our matrix values are evenly spread around
      // the center point of the matrix
      // See test data for 'can generate gaussian image map data'
      // in __tests_/utils/make-gaussian-matrix.test.ts for an example
      const gValue = getGaussianMatrixValue(xIndex + 0.5, yIndex + 0.5)
      data[yIndex][xIndex] = gValue;
    }
  }

  return data;
}

export default makeGaussian;
