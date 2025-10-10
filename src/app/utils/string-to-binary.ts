// This is the fastest according to the results of `src/app/utils/str-to-b-benchmark.ts` run under bun
export const stringToBinaryArray = (input: string) => {
    const binaryArray = [];

    for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i);
        let binaryValue = '';

        for (let j = 7; j >= 0; j--) {
            binaryValue += (charCode >> j) & 1;
        }

        binaryArray.push(binaryValue)
    }

    return binaryArray;
}

export const convertToBinaryArrayApproach2 = (input: string) => {
    const binaryArray = [];

    for (const char of input) {
      const codePoint = char.codePointAt(0);
      if (codePoint) {
        const binaryValue = codePoint.toString(2);
        binaryArray.push(binaryValue.padStart(8, '0') );
      }
    }

    return binaryArray;
}

export const convertToBinaryArrayApproach3 = async (input: string): Promise<string[]> => {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(input);
  return [...encodedData].map(byte =>
    byte.toString(2).padStart(8, '0')
  );
}

export const stringToBinaryArrayWithArrayFrom = (input: string) => {
  return Array.from(input, char =>
    char.charCodeAt(0).toString(2).padStart(8, '0'));
}

export const stringToBinaryArrayUint8Array = (input: string)  => {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(input);
    return Array.from(encoded).map(byte => {
        return byte.toString(2).padStart(8, '0');
    });
}