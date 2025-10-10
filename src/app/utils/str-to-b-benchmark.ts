import { convertToBinaryArrayApproach2, convertToBinaryArrayApproach3, stringToBinaryArray, stringToBinaryArrayUint8Array, stringToBinaryArrayWithArrayFrom } from "./string-to-binary";


class BenchmarkTimer {
  readonly start = performance.now();

  constructor(private readonly name: string) {}

  stop() {
    const time = performance.now() - this.start;
    console.log(`Timer: ${this.name} finished in ${Math.round(time)} ms`);
  }
}

const benchmark = (label: string, fn: (a: string) => string[], input: string, iterations: number) => {
  const t = new BenchmarkTimer(label);
  for (let i = iterations; i > 0; i--) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const output = fn(input);
  }
  t.stop();
}

const asyncBenchmark = async (label: string, fn: (a: string) => Promise<string[]>, input: string, iterations: number) => {
  const t = new BenchmarkTimer(label);
  for (let i = iterations; i > 0; i--) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const output = await fn(input);
  }
  t.stop();

}


const benchmarkString = 'this iz top secrit! do not reveeel.';

const iterations = 1000000

console.log(stringToBinaryArray(benchmarkString))
benchmark('stringToBinaryArray', stringToBinaryArray, benchmarkString, iterations);

console.log(convertToBinaryArrayApproach2(benchmarkString))
benchmark('convertToBinaryArrayApproach2', convertToBinaryArrayApproach2, benchmarkString, iterations);

console.log(stringToBinaryArrayWithArrayFrom(benchmarkString))
benchmark('stringToBinaryArrayWithArrayFrom', stringToBinaryArrayWithArrayFrom, benchmarkString, iterations);

console.log(stringToBinaryArrayUint8Array(benchmarkString))
benchmark('stringToBinaryArrayUint8Array', stringToBinaryArrayUint8Array, benchmarkString, iterations);

console.log(convertToBinaryArrayApproach2(benchmarkString))
asyncBenchmark('convertToBinaryArrayApproach3', convertToBinaryArrayApproach3, benchmarkString, iterations);