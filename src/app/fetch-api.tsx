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
      throw new Error('Failed to fetch data');
    }

    data = await response.json();
  } catch (error) {
    console.error('Error fetching data: ', error)
  }

  return data;
}

export default FetchApiOnClient;