from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from library.models import Book, BorrowRecord


class Command(BaseCommand):
    help = "Seed database with books and borrow records"

    def handle(self, *args, **options):
        BorrowRecord.objects.all().delete()
        Book.objects.all().delete()

        books_data = [
            ("Clean Code", "Robert C. Martin", "9780132350884", 5),
            ("Introduction to Algorithms", "Cormen et al.", "9780262046305", 4),
            ("Design Patterns", "Erich Gamma et al.", "9780201633610", 3),
            ("The Pragmatic Programmer", "Andrew Hunt", "9780135957059", 4),
            ("Refactoring", "Martin Fowler", "9780134757599", 3),
            ("You Don't Know JS", "Kyle Simpson", "9781098124045", 6),
            ("The Alchemist", "Paulo Coelho", "9780061122415", 5),
            ("Sapiens", "Yuval Noah Harari", "9780062316110", 5),
            ("Atomic Habits", "James Clear", "9780735211292", 6),
            ("The Hobbit", "J.R.R. Tolkien", "9780547928227", 4),
        ]

        books = []
        for title, author, isbn, copies in books_data:
            books.append(
                Book.objects.create(
                    title=title,
                    author=author,
                    isbn=isbn,
                    total_copies=copies,
                    available_copies=copies,
                )
            )

        today = timezone.localdate()

        seed_records = [
            {
                "book": books[0],
                "student_name": "Anita Roy",
                "student_roll_no": "CS21-001",
                "borrowed_date": today - timedelta(days=25),
                "due_date": today - timedelta(days=11),
                "is_returned": True,
                "returned_date": today - timedelta(days=12),
            },
            {
                "book": books[1],
                "student_name": "Rahul Das",
                "student_roll_no": "CS21-014",
                "borrowed_date": today - timedelta(days=18),
                "due_date": today - timedelta(days=4),
                "is_returned": True,
                "returned_date": today - timedelta(days=3),
            },
            {
                "book": books[2],
                "student_name": "Mina Sen",
                "student_roll_no": "CS21-032",
                "borrowed_date": today - timedelta(days=30),
                "due_date": today - timedelta(days=16),
                "is_returned": False,
                "returned_date": None,
            },
            {
                "book": books[3],
                "student_name": "Farhan Ali",
                "student_roll_no": "CS21-041",
                "borrowed_date": today - timedelta(days=22),
                "due_date": today - timedelta(days=8),
                "is_returned": False,
                "returned_date": None,
            },
            {
                "book": books[4],
                "student_name": "Riya Nair",
                "student_roll_no": "CS21-055",
                "borrowed_date": today - timedelta(days=6),
                "due_date": today + timedelta(days=8),
                "is_returned": False,
                "returned_date": None,
            },
            {
                "book": books[5],
                "student_name": "Karan Mehta",
                "student_roll_no": "CS21-060",
                "borrowed_date": today - timedelta(days=3),
                "due_date": today + timedelta(days=11),
                "is_returned": False,
                "returned_date": None,
            },
        ]

        for item in seed_records:
            BorrowRecord.objects.create(**item)

        for book in books:
            active_count = BorrowRecord.objects.filter(book=book, is_returned=False).count()
            book.available_copies = max(book.total_copies - active_count, 0)
            book.save(update_fields=["available_copies"])

        self.stdout.write(self.style.SUCCESS("Seed data created successfully."))
