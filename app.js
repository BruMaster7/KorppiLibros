'use strict';
const DEFAULT_PAGE = 2;
const LIMIT = 18;
const API_URL = 'https://korppi-api-brown.vercel.app';

async function getBooks(){
    const page = getPageFromUrl() || DEFAULT_PAGE;
    const search = getSearch();
    const { data } = await axios.get(`${API_URL}/books?page=${page}&limit=${LIMIT}&search=${search}`);
    console.log(search);
    const container = document.getElementById('booksContainer');
    container.innerHTML = '';
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
    const search = getSearch();
    const { data } = await axios.get(`${API_URL}/books?page=${page}&limit=${LIMIT}&search=${search}`);
    const paginationElement = document.getElementById("pagination");
    paginationElement.innerHTML = '<div class="divide"></div>'
    const pagination = createPagination(data, page);
    console.log("PAGINATION");
    console.log(pagination);
    pagination.forEach(element => element ? paginationElement.append(element) : null);

}

function getSearch() {
  const url = new URL(window.location.href);
  return url.searchParams.get("search") || '';  
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
      previousPage.innerHTML = `<a href="?page=${Number(page)-1}&search=${getSearch()}">PREVIA</a>`;
    } 
    
    if (data.nextPage) {
      nextPage = document.createElement('div');
      nextPage.classList.add('next-page');
      nextPage.innerHTML = `<a href="?page=${Number(page)+1}&search=${getSearch()}">SIGUIENTE</a>`;
    }
    return [previousPage, nextPage];
}

function init() {
  getBooks();
  getPagination();
  document.getElementById('searchForm').addEventListener('submit',  e => {
    e.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set("page", 1);
    url.searchParams.set("search", document.getElementById("search").value);
    history.pushState({}, "", url);
    getBooks();
    getPagination();
  });
  document.getElementById('searchButton').addEventListener('click', () =>  document.getElementById('searchForm').dispatchEvent(new Event('submit')));
}
  
document.addEventListener("DOMContentLoaded", init);
