
from django.db import transaction as db_transaction
from django.db.models import F
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.exceptions import PermissionDenied

from accounts.models import Account
from transactions.models import Transaction
from .models import Payment
from .serializers import PaymentSerializer


class BillPaymentView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        payments = Payment.objects.filter(
            user=request.user
        ).select_related("account").order_by("-created_at")

        serializer = PaymentSerializer(payments, many=True)

        return Response({
            "count": payments.count(),
            "payments": serializer.data
        })

    def post(self, request):

        if not hasattr(request.user, "profile") or (
            request.user.profile.role != "customer"
        ):
            raise PermissionDenied(
                "Only customers can make bill payments."
            )

        account_number = request.data.get("account_number")
        bill_type = request.data.get("bill_type")
        provider = request.data.get("provider")
        consumer_reference = request.data.get("consumer_reference")
        amount = request.data.get("amount")

        # Validate required fields
        if not all([
            account_number,
            bill_type,
            provider,
            consumer_reference,
            amount
        ]):
            return Response(
                {"error": "All payment fields are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate bill type
        valid_types = dict(Payment.BILL_TYPES)

        if bill_type not in valid_types:
            return Response(
                {"error": "Invalid bill type."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate amount
        try:
            from decimal import Decimal, InvalidOperation
            amount = Decimal(str(amount))

            if not amount.is_finite() or amount <= 0:
                raise ValueError

        except (InvalidOperation, ValueError, TypeError):
            return Response(
                {"error": "Enter a valid positive payment amount."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with db_transaction.atomic():

                account = Account.objects.select_for_update().get(
                    account_number=account_number,
                    user=request.user
                )

                if account.status != "active":
                    return Response(
                        {"error": "Your account is not active."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if account.balance < amount:
                    return Response(
                        {"error": "Insufficient account balance."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                account.balance = F("balance") - amount
                account.save(update_fields=["balance"])
                account.refresh_from_db()

                payment = Payment.objects.create(
                    user=request.user,
                    account=account,
                    bill_type=bill_type,
                    provider=provider,
                    consumer_reference=consumer_reference,
                    amount=amount,
                    status="completed"
                )

                Transaction.objects.create(
                    sender=account,
                    receiver=None,
                    amount=amount,
                    transaction_type="withdrawal",
                    status="completed",
                    description=f"Bill payment: {bill_type} - {provider}"
                )

            return Response({
                "message": "Bill payment successful.",
                "payment": PaymentSerializer(payment).data,
                "remaining_balance": str(account.balance)
            }, status=status.HTTP_201_CREATED)

        except Account.DoesNotExist:
            return Response(
                {"error": "Account not found."},
                status=status.HTTP_404_NOT_FOUND
            )
