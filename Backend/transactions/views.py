from django.db import transaction as db_transaction
from django.db.models import F
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from accounts.models import Account
from .models import Transaction
from .serializers import TransferSerializer


class FundTransferView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        # Step 1: Validate request data
        serializer = TransferSerializer(
            data=request.data,
            context={"request": request}
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data

        sender_number = data["sender_account_number"]
        receiver_number = data["receiver_account_number"]
        amount = data["amount"]
        description = data.get("description", "")

        # Step 2: Perform transfer inside database transaction
        try:
            with db_transaction.atomic():

                # Lock both accounts to prevent concurrent modifications
                accounts = Account.objects.select_for_update().filter(
                    account_number__in=[
                        sender_number,
                        receiver_number
                    ]
                ).order_by("id")

                account_map = {
                    account.account_number: account
                    for account in accounts
                }

                sender = account_map.get(sender_number)
                receiver = account_map.get(receiver_number)

                # Step 3: Check account existence
                if not sender or not receiver:
                    return Response(
                        {"error": "Sender or receiver account not found."},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # Step 4: Verify sender ownership
                if sender.user_id != request.user.id:
                    return Response(
                        {"error": "You cannot transfer from this account."},
                        status=status.HTTP_403_FORBIDDEN
                    )

                # Step 5: Check account status
                if sender.status != "active" or receiver.status != "active":
                    return Response(
                        {"error": "Both accounts must be active."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Step 6: Check sufficient balance
                if sender.balance < amount:
                    return Response(
                        {"error": "Insufficient account balance."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Step 7: Update balances
                sender.balance = F("balance") - amount
                receiver.balance = F("balance") + amount

                sender.save(update_fields=["balance"])
                receiver.save(update_fields=["balance"])

                # Refresh balances after F() expressions
                sender.refresh_from_db()
                receiver.refresh_from_db()

                # Step 8: Create transaction record
                new_transaction = Transaction.objects.create(
                    sender=sender,
                    receiver=receiver,
                    amount=amount,
                    transaction_type="transfer",
                    status="completed",
                    description=description
                )

            # Step 9: Return successful response
            return Response(
                {
                    "message": "Fund transfer successful!",
                    "transaction": {
                        "transaction_id": str(new_transaction.transaction_id),
                        "sender_account": sender.account_number,
                        "receiver_account": receiver.account_number,
                        "amount": str(amount),
                        "status": new_transaction.status,
                        "description": description,
                        "created_at": new_transaction.created_at
                    },
                    "remaining_balance": str(sender.balance)
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {"error": "Transfer failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )