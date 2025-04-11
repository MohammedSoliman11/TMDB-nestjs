const axios = require('axios');

async function syncMovies() {
  try {
    console.log('Starting movie sync...');
    const response = await axios.get('http://localhost:8080/movies/sync');
    console.log('Movie sync completed:', response.data);
  } catch (error) {
    console.error('Movie sync failed:', error.message);
  }
}

syncMovies();