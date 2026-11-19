
import uuid

from django.db import models


class Transaction(models.Model):

    TRANSACTION_TYPES = [
        ("transfer", "Fund Transfer"),
        ("deposit", "Deposit"),
        ("withdrawal", "Withdrawal"),
    ]

    TRANSACTION_STATUS = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    # Sender account
    sender = models.ForeignKey(
        "accounts.Account",
        on_delete=models.PROTECT,
        related_name="sent_transactions",
        null=True,
        blank=True
    )

    # Receiver account
    receiver = models.ForeignKey(
        "accounts.Account",
        on_delete=models.PROTECT,
        related_name="received_transactions",
        null=True,
        blank=True
    )

    # Transaction amount
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    # Unique transaction reference
    transaction_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False
    )

    # Transaction type
    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPES
    )

    # Transaction status
    status = models.CharField(
        max_length=20,
        choices=TRANSACTION_STATUS,
        default="pending"
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.transaction_id}"
