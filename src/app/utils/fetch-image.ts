const FetchImageOnClient = async (imageURL: string): Promise<Blob | Error> => {
  let data;
  try {
    const response: Response = await fetch(imageURL, {
      headers: {
        Accept: 'image/jpeg, image/png',
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch image: ${response.status} - ${response.statusText} - ${await response.text()}`);
    }

    data = await response.blob();
  } catch (error) {
    return Promise.reject(error as Error);
  }

  return data;
}

export default FetchImageOnClient;