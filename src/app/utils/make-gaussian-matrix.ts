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

  for (let hIndex = 0; hIndex < height; hIndex++) {
    data[hIndex] = [];
    for (let wIndex = 0; wIndex < width; wIndex++) {
      // Adding 0.5 to the coordinates gives us the middle of the
      // pixel, ensuring our matrix values are evenly spread around
      // the center point of the matrix
      // See test data for 'can generate gaussian image map data'
      // in __tests_/utils/make-gaussian-matrix.test.ts for an example
      const gValue = getGaussianMatrixValue(wIndex + 0.5, hIndex + 0.5)
      data[hIndex][wIndex] = gValue;
    }
  }

  return data;
}

export default makeGaussian;

// // USAGE
// var gaussian = makeGaussian(300, 200, 200, 50, 50);

// console.log(gaussian(100,100)); // ~5
// console.log(gaussian(200, 200)); // 300
