
from django.db import models
from django.conf import settings
from accounts.models import Account


class Loan(models.Model):

    LOAN_STATUS = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="loans"
    )

    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="loans"
    )

    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    purpose = models.TextField()

    tenure_months = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=LOAN_STATUS,
        default="pending"
    )

    remarks = models.TextField(blank=True)

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_loans"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Loan {self.id} - {self.user.username}"
