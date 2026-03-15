from django.contrib import admin

from .models import Book, BorrowRecord


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "isbn", "total_copies", "available_copies", "added_at")
    search_fields = ("title", "author", "isbn")


@admin.register(BorrowRecord)
class BorrowRecordAdmin(admin.ModelAdmin):
    list_display = (
        "book",
        "student_name",
        "student_roll_no",
        "borrowed_date",
        "due_date",
        "returned_date",
        "is_returned",
    )
    search_fields = ("student_name", "student_roll_no", "book__title")
