import axios from 'axios';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';

export async function getContent(query, currentPage = 1, perPage = 40) {
  try {
    const BASE_URL = 'https://pixabay.com/api/';
    const API_KEY = '39741011-1a4910bf2d95eb73249b8bb60';
    const responce = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${query}&page=${currentPage}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`
    );
    return responce;
  } catch (error) {
    Notiflix.Notify.failure();
    console.error(error);
  }
}
