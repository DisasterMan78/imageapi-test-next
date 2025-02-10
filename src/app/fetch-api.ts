const FetchApiOnClient = async (apiURL: string) => {
  let data;
  try {
    const response = await fetch(apiURL, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (response.status !== 200) {
      throw Error(`Failed to fetch data: ${response.status} - ${response.statusText}`);
    }

    data = await response.json();
  } catch (error) {
    return error;
  }

  return data;
}

export default FetchApiOnClient;