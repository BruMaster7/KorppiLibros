import os
from fastapi import FastAPI, Request
from pydantic import BaseModel, HttpUrl
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
MONGO_URL = f'mongodb+srv://{os.getenv("MONGO_USERNAME")}:{os.getenv("MONGO_PASSWORD")}@{os.getenv("MONGO_HOST")}/{os.getenv("MONGO_DATABASE")}'
LIMIT = 2
@app.get("/")
async def root():
    return {"message": "Hello World"}


class Book(BaseModel):
    _id: str
    title: str
    author: Optional[str] 
    price: float
    image: Optional[HttpUrl]
    permalink: HttpUrl


class BookList(BaseModel):
    count: int
    results: list[Book]
    previous: Optional[HttpUrl]
    nextPage: Optional[HttpUrl]


@app.get("/books")
async def list_books(request: Request, page: int = 1, limit: int = LIMIT, search: Optional[str] = None) -> BookList:
    url_main = f'{request.url.scheme}://{request.client.host}:{request.url.port}'
    client = MongoClient(host=MONGO_URL)
    limit = limit if limit>0 and limit<=30 else LIMIT
    limit_page = limit * (page - 1)
    query = {}
    if search:
        query['$text'] = {"$search": search}
    try:
        num_books = client.korppi.book.count_documents(query)
        book_list = [parse_book(book) for book in client.korppi.book.find(query).limit(limit).skip(limit_page)]
    except ServerSelectionTimeoutError:
        num_books = 0
        book_list = []
    max_page = num_books / limit
    previous_page = f'{url_main}/books?page={page-1}&limit={limit}' if page>1 else None
    next_page = f'{url_main}/books?page={page+1}&limit={limit}' if page<max_page else None
    print(book_list)
   
   # return {'count': num_books, 'results': book_list, 'previous': previous_page, 'nextPage': next_page}
    return BookList(count=num_books, results=book_list, previous=previous_page, nextPage=next_page)

def parse_book(book):
    book['_id'] = str(book['_id'])
    return Book(
        _id=str(book['_id']),
        title=book['title'], 
        author=book.get('author'), 
        price=book['price'], 
        image=book.get('image'),
        permalink=book['permalink']
    )

