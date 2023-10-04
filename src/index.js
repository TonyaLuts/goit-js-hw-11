import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { getContent } from './PixabayAPI';
import { renderCard } from './markup';

export const refs = {
  formEl: document.querySelector('.search-form'),
  inputEl: document.querySelector('.text-field'),
  gallery: document.querySelector('.gallery'),
  loadBtn: document.querySelector('.load-more'), // для кнопки load'more
  target: document.querySelector('.js-guard'),
};

let query = '';
let currentPage = 1;
let perPage = 40;
const lightbox = new SimpleLightbox('.gallery a', {
  animationSpeed: 300,
});

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(onLoad, options);

refs.formEl.addEventListener('submit', onFormSubmit);
// refs.loadBtn.addEventListener('click', onLoad); // для кнопки load'more

async function onFormSubmit(event) {
  try {
    event.preventDefault();
    refs.gallery.innerHTML = '';
    // refs.loadBtn.hidden = true; // для кнопки load'more
    currentPage = 1;
    query = event.currentTarget.elements.searchQuery.value;
    await getContent(query, currentPage, perPage)
      .then(({ data }) => {
        if (query === '') {
          refs.gallery.innerHTML = '';
          Notiflix.Notify.warning(
            'The field is empty. Please enter your request'
          );
          return;
        }
        if (data.hits.length === 0) {
          Notiflix.Notify.warning(
            'Sorry, there are no images matching your search query. Please try again.'
          );
          return;
        }
        renderCard(data.hits);
        observer.observe(refs.target);
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        // refs.loadBtn.hidden = false; // для кнопки load'more
        lightbox.refresh();
        return;
      })
      .catch(error => {
        Notiflix.Notify.failure();
        console.error(error);
      });
  } catch (error) {
    Notiflix.Notify.failure();
    console.error(error);
  }
}

async function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;
      getContent(query, currentPage, perPage)
        .then(({ data }) => {
          renderCard(data.hits);
          const totalPages = Math.ceil(data.totalHits / perPage);
          if (totalPages <= currentPage) {
            observer.unobserve(refs.target);
            setTimeout(() => {
              Notiflix.Notify.warning(
                "We're sorry, but you've reached the end of search results."
              );
            }, 1000);
          }
          lightbox.refresh();
          return;
        })
        .catch(error => {
          Notiflix.Notify.failure();
          console.error(error);
        });
    }
  });
}

// для кнопки load'more

// async function onLoad() {
//   currentPage += 1;
//   await getContent(query, currentPage, perPage)
//     .then(({ data }) => {
//       const totalPages = Math.ceil(data.totalHits / perPage);
//       if (totalPages === currentPage) {
//         refs.loadBtn.hidden = true;
//         Notiflix.Notify.warning(
//           "We're sorry, but you've reached the end of search results."
//         );
//         return;
//       }
//       renderCard(data.hits);
//       lightbox.refresh();
//       return;
//     })
//     .catch(error => {
//       Notiflix.Notify.failure();
//       console.error(error);
//     });
// }
