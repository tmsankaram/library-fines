from datetime import timedelta

from django.db import models
from django.utils import timezone


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=20, unique=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.author}"


class BorrowRecord(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="borrow_records")
    student_name = models.CharField(max_length=120)
    student_roll_no = models.CharField(max_length=50)
    borrowed_date = models.DateField(default=timezone.localdate)
    due_date = models.DateField(blank=True)
    returned_date = models.DateField(null=True, blank=True)
    is_returned = models.BooleanField(default=False)

    class Meta:
        ordering = ["-borrowed_date", "-id"]

    def save(self, *args, **kwargs):
        if not self.due_date:
            self.due_date = self.borrowed_date + timedelta(days=14)
        super().save(*args, **kwargs)

    @property
    def fine_amount(self):
        today = timezone.localdate()
        if not self.is_returned and today > self.due_date:
            return (today - self.due_date).days * 5
        return 0

    def __str__(self):
        return f"{self.student_name} - {self.book.title}"
