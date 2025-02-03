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
      return Error('Failed to fetch data');
    }

    data = await response.json();
  } catch (error) {
    return Error('Failed to fetch data', error as ErrorOptions);
  }

  return data;
}

export default FetchApiOnClient;