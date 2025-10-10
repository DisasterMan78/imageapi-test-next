export const binaryToString = (binaryArray: string[]) => {
  const characterArray = binaryArray.map((element) =>
    String.fromCharCode(parseInt(element, 2)));

  return characterArray.join("");
}
