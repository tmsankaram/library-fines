from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Book, BorrowRecord
from .serializers import BookSerializer, BorrowCreateSerializer, BorrowRecordSerializer


class BookListCreateAPIView(generics.ListCreateAPIView):
    queryset = Book.objects.all().order_by("-added_at")
    serializer_class = BookSerializer


class BookRetrieveAPIView(generics.RetrieveAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer


class BorrowListCreateAPIView(APIView):
    def get(self, request):
        records = BorrowRecord.objects.select_related("book").all()
        serializer = BorrowRecordSerializer(records, many=True)
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        payload = BorrowCreateSerializer(data=request.data)
        payload.is_valid(raise_exception=True)

        book_id = payload.validated_data["book_id"]
        student_name = payload.validated_data["student_name"]
        student_roll_no = payload.validated_data["student_roll_no"]

        book = Book.objects.select_for_update().filter(id=book_id).first()
        if not book:
            return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)

        if book.available_copies <= 0:
            return Response({"detail": "No copies available for borrowing."}, status=status.HTTP_400_BAD_REQUEST)

        book.available_copies -= 1
        book.save(update_fields=["available_copies"])

        borrow_record = BorrowRecord.objects.create(
            book=book,
            student_name=student_name,
            student_roll_no=student_roll_no,
            borrowed_date=timezone.localdate(),
        )

        serializer = BorrowRecordSerializer(borrow_record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReturnBorrowAPIView(APIView):
    @transaction.atomic
    def post(self, request, pk):
        record = BorrowRecord.objects.select_related("book").select_for_update().filter(id=pk).first()
        if not record:
            return Response({"detail": "Borrow record not found."}, status=status.HTTP_404_NOT_FOUND)

        if record.is_returned:
            return Response({"detail": "Book already returned."}, status=status.HTTP_400_BAD_REQUEST)

        record.is_returned = True
        record.returned_date = timezone.localdate()
        record.save(update_fields=["is_returned", "returned_date"])

        record.book.available_copies += 1
        record.book.save(update_fields=["available_copies"])

        return Response(BorrowRecordSerializer(record).data)


class FineListAPIView(APIView):
    def get(self, request):
        today = timezone.localdate()
        records = BorrowRecord.objects.select_related("book").filter(is_returned=False, due_date__lt=today)
        ordered_records = sorted(records, key=lambda r: r.fine_amount, reverse=True)
        serializer = BorrowRecordSerializer(ordered_records, many=True)
        return Response(serializer.data)
