export const FetchApiOnClient = async (apiURL: string) => {
  let data;
  try {
    const response = await fetch(apiURL, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch data: ${response.status} - ${response.statusText}`);
    }

    data = await response.json();
  } catch (error) {
    return Promise.reject(error as Error);
  }

  return data;
}

export default FetchApiOnClient;