const FetchImageOnClient = async (imageURL: string): Promise<Blob | Error> => {
  let data;
  try {
    const response = await fetch(imageURL, {
      headers: {
        Accept: '	image/jpeg',
      },
    });

    if (response.status !== 200) {
      throw Error(`Failed to fetch image: ${response.status} - ${response.statusText}`);
    }

    data = await response.blob();
  } catch (error) {
    return error as Error;
  }

  return data;
}

export default FetchImageOnClient;