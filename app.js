'use strict';
const DEFAULT_PAGE = 2;
const LIMIT = 18;

async function getBooks(){
    const page = getPageFromUrl() || DEFAULT_PAGE;
    const { data } = await axios.get(`http://localhost:8000/books?page=${page}&limit=${LIMIT}`);
    const container = document.getElementById('booksContainer');
    for (const book of data.results) {
        const card = createCard(book);
        container.append(card);
    }
}

function getPageFromUrl() {
  const queryParams = parseQueryParams();
  return queryParams.page;
}

function parseQueryParams() {
  const queryParamsString = window.location.href.split('?')[1] || '';
  const queryParams = {};
  for (const queryParam of queryParamsString.split('&')) {
    const [key, value] = queryParam.split('=');
    queryParams[key] = value;
  }
  return queryParams
}

async function getPagination(){
    const page = getPageFromUrl() || DEFAULT_PAGE;
    const { data } = await axios.get(`http://localhost:8000/books?page=${page}&limit=${LIMIT}`);
    const paginationElement = document.getElementById("pagination");
    paginationElement.innerHTML = '<div class="divide"></div>'
    const pagination = createPagination(data, page);
    console.log("PAGINATION");
    console.log(pagination);
    pagination.forEach(element => element ? paginationElement.append(element) : null);

}

function createCard(book){
    const card = document.createElement('div');
    card.classList.add('book');
    card.innerHTML = `<img src="${book.image}" alt="book">`;
    card.innerHTML += `<h3>${book.title}</h3>`;
    card.innerHTML += `<a target="_blank" href="${book.permalink}" class="button"><button>$${book.price}</button></a>`;
    return card;

}

 function createPagination(data, page) {
    let previousPage, nextPage;

    if (data.previous) {
      previousPage = document.createElement('div');
      previousPage.classList.add('previous');
      previousPage.innerHTML = `<a href="?page=${Number(page)-1}">PREVIA</a>`;
    } 
    
    if (data.nextPage) {
      nextPage = document.createElement('div');
      nextPage.classList.add('next-page');
      nextPage.innerHTML = `<a href="?page=${Number(page)+1}">SIGUIENTE</a>`;
    }
    return [previousPage, nextPage];
}

function init() {
    getBooks();
    getPagination();
  }
  
  document.addEventListener("DOMContentLoaded", init);

/* <div class="book">
<img src="/img/De Sangre y Cenizas.webp" alt="book">
<h3>De Sangre y Cenizas</h3>
<a href="/" class="button"><button>$1290</button></a>
</div> */
