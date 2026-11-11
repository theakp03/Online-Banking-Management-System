from rest_framework import serializers
from .models import Account


class AccountSerializer(serializers.ModelSerializer):

    class Meta:
        model = Account
        fields = [
            "id",
            "account_number",
            "account_type",
            "balance",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "account_number",
            "balance",
            "status",
            "created_at",
            "updated_at",
        ]