from rest_framework import serializers

from .models import Book, BorrowRecord


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "author",
            "isbn",
            "total_copies",
            "available_copies",
            "added_at",
        ]
        read_only_fields = ["id", "added_at"]


class BorrowRecordSerializer(serializers.ModelSerializer):
    fine_amount = serializers.ReadOnlyField()
    book_title = serializers.CharField(source="book.title", read_only=True)

    class Meta:
        model = BorrowRecord
        fields = [
            "id",
            "book",
            "book_title",
            "student_name",
            "student_roll_no",
            "borrowed_date",
            "due_date",
            "returned_date",
            "is_returned",
            "fine_amount",
        ]
        read_only_fields = ["id", "borrowed_date", "due_date", "returned_date", "is_returned", "fine_amount"]


class BorrowCreateSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()
    student_name = serializers.CharField(max_length=120)
    student_roll_no = serializers.CharField(max_length=50)
