/* eslint-disable @next/next/no-async-client-component */
'use client';

const FetchImageOnClient = async (imageURL: string): Promise<Blob | Error> => {
  let data;
  try {
    const response = await fetch(imageURL, {
      headers: {
        Accept: '	image/jpeg',
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