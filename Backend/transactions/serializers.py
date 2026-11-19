
from rest_framework import serializers
from accounts.models import Account


class TransferSerializer(serializers.Serializer):

    sender_account_number = serializers.CharField(
        max_length=12
    )

    receiver_account_number = serializers.CharField(
        max_length=12
    )

    amount = serializers.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    description = serializers.CharField(
        required=False,
        allow_blank=True
    )

    def validate(self, attrs):

        request = self.context.get("request")

        sender_number = attrs["sender_account_number"]
        receiver_number = attrs["receiver_account_number"]
        amount = attrs["amount"]

        # Validate amount
        if amount <= 0:
            raise serializers.ValidationError(
                {"amount": "Transfer amount must be greater than zero."}
            )

        # Find sender account belonging to logged-in user
        try:
            sender = Account.objects.get(
                account_number=sender_number,
                user=request.user
            )
        except Account.DoesNotExist:
            raise serializers.ValidationError(
                {"sender_account_number": "Sender account not found."}
            )

        # Find receiver account
        try:
            receiver = Account.objects.get(
                account_number=receiver_number
            )
        except Account.DoesNotExist:
            raise serializers.ValidationError(
                {"receiver_account_number": "Receiver account not found."}
            )

        # Check account status
        if sender.status != "active":
            raise serializers.ValidationError(
                {"sender_account_number": "Your account is not active."}
            )

        if receiver.status != "active":
            raise serializers.ValidationError(
                {"receiver_account_number": "Receiver account is not active."}
            )

        # Prevent self-transfer
        if sender.id == receiver.id:
            raise serializers.ValidationError(
                {"receiver_account_number": "Cannot transfer to your own account."}
            )

        # Check available balance
        if sender.balance < amount:
            raise serializers.ValidationError(
                {"amount": "Insufficient account balance."}
            )

        attrs["sender"] = sender
        attrs["receiver"] = receiver

        return attrs
