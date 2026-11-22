
from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):

    account_number = serializers.CharField(
        source="account.account_number",
        read_only=True
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "account_number",
            "bill_type",
            "provider",
            "consumer_reference",
            "amount",
            "payment_reference",
            "status",
            "created_at"
        ]

        read_only_fields = [
            "id",
            "payment_reference",
            "status",
            "created_at"
        ]
