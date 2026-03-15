from django.urls import path

from .views import (
    BookListCreateAPIView,
    BookRetrieveAPIView,
    BorrowListCreateAPIView,
    FineListAPIView,
    ReturnBorrowAPIView,
)

urlpatterns = [
    path("books/", BookListCreateAPIView.as_view(), name="books-list-create"),
    path("books/<int:pk>/", BookRetrieveAPIView.as_view(), name="book-detail"),
    path("borrow/", BorrowListCreateAPIView.as_view(), name="borrow-list-create"),
    path("borrow/<int:pk>/return/", ReturnBorrowAPIView.as_view(), name="borrow-return"),
    path("fines/", FineListAPIView.as_view(), name="fines-list"),
]
