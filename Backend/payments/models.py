import uuid
from django.db import models
from django.conf import settings
from accounts.models import Account


class Payment(models.Model):

    BILL_TYPES = [
        ("electricity", "Electricity"),
        ("water", "Water"),
        ("gas", "Gas"),
        ("internet", "Internet"),
        ("mobile", "Mobile Recharge"),
    ]

    PAYMENT_STATUS = [
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bill_payments"
    )

    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="bill_payments"
    )

    bill_type = models.CharField(
        max_length=20,
        choices=BILL_TYPES
    )

    provider = models.CharField(max_length=100)

    consumer_reference = models.CharField(max_length=100)

    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    payment_reference = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False
    )

    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default="completed"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.bill_type} - {self.payment_reference}"
