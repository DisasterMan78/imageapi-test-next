// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reverseArray = (array: any[]) => {
  let start = 0;
  let end = array.length - 1 ;

  while (start < end) {
      const temp = array[start];
      array[start] = array[end];
      array[end] = temp;

      start++;
      end--;
  }
return array;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reverse2dArrayColumns = (array: any[][]) => {
  for (let i = 0; i < array.length; i++) {
    array[i] = reverseArray(array[i]);
  }
  return array;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const rotate2dArray = (array: any[][]) => reverseArray(reverse2dArrayColumns(array));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const join2dArraysHorizontally = (array1: any[][], array2: any[][]) => {
  for (let i = 0; i < array1.length; i++) {
    array1[i] = array1[i].concat(array2[i]);
  }
  return array1;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const join2dArrayQuarters = (array1: any[][], array2: any[][], array3: any[][], array4: any[][]) => {
  array1 = join2dArraysHorizontally(array1, array2);
  // for (let i = 0; i < array1.length; i++) {
  //   array1[i] = array1[i].concat(array2[i]);
  // }
  for (let i = 0; i < array1.length; i++) {
    array3[i] = array3[i].concat(array4[i]);
  }
  return array1.concat(array3);
}