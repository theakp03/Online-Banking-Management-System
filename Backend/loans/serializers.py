
from rest_framework import serializers
from .models import Loan
from accounts.models import Account


class LoanSerializer(serializers.ModelSerializer):

    account_number = serializers.CharField(
        source="account.account_number",
        read_only=True
    )

    class Meta:
        model = Loan
        fields = [
            "id",
            "account",
            "account_number",
            "amount",
            "purpose",
            "tenure_months",
            "status",
            "remarks",
            "created_at",
            "reviewed_at"
        ]

        read_only_fields = [
            "id",
            "status",
            "remarks",
            "created_at",
            "reviewed_at"
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Loan amount must be greater than zero."
            )
        return value

    def validate_tenure_months(self, value):
        if value < 1 or value > 360:
            raise serializers.ValidationError(
                "Tenure must be between 1 and 360 months."
            )
        return value

    def validate_account(self, account):
        request = self.context["request"]

        if account.user != request.user:
            raise serializers.ValidationError(
                "You can only apply using your own account."
            )

        if account.status != "active":
            raise serializers.ValidationError(
                "Only active bank accounts can be used."
            )

        return account
