
import secrets

from django.conf import settings
from django.db import models


class Account(models.Model):

    ACCOUNT_TYPES = [
        ("savings", "Savings Account"),
        ("current", "Current Account"),
    ]

    ACCOUNT_STATUS = [
        ("pending", "Pending"),
        ("active", "Active"),
        ("frozen", "Frozen"),
        ("closed", "Closed"),
    ]

    # Account owner
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bank_accounts"
    )

    # Unique 12-digit bank account number
    account_number = models.CharField(
        max_length=12,
        unique=True,
        blank=True
    )

    # Account type
    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPES,
        default="savings"
    )

    # Account balance
    balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0.00
    )

    # Account status
    status = models.CharField(
        max_length=20,
        choices=ACCOUNT_STATUS,
        default="pending"
    )

    # Account creation date
    created_at = models.DateTimeField(auto_now_add=True)

    # Last updated date
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):

        if not self.account_number:

            while True:
                number = str(
                    secrets.randbelow(900000000000) + 100000000000
                )

                if not Account.objects.filter(
                    account_number=number
                ).exists():
                    self.account_number = number
                    break

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.account_number} - {self.user.username}"
