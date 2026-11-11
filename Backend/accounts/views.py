from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Account
from .serializers import AccountSerializer


def get_user_role(user):
    if user.is_superuser:
        return "administrator"

    profile = getattr(user, "profile", None)

    if profile:
        return profile.role

    return None


class AccountListCreateView(generics.ListCreateAPIView):

    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        role = get_user_role(self.request.user)

        if role in ["banking_staff", "manager", "administrator"]:
            return Account.objects.all().order_by("-created_at")

        if role == "customer":
            return Account.objects.filter(
                user=self.request.user
            ).order_by("-created_at")

        return Account.objects.none()

    def perform_create(self, serializer):
        role = get_user_role(self.request.user)

        if role != "customer":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "Only customers can request a bank account."
            )

        serializer.save(user=self.request.user)


class AccountDetailView(generics.RetrieveAPIView):

    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        role = get_user_role(self.request.user)

        if role in ["banking_staff", "manager", "administrator"]:
            return Account.objects.all()

        if role == "customer":
            return Account.objects.filter(user=self.request.user)

        return Account.objects.none()


class ApproveAccountView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        role = get_user_role(request.user)

        if role not in ["banking_staff", "manager", "administrator"]:
            return Response(
                {"error": "You do not have permission to approve accounts."},
                status=status.HTTP_403_FORBIDDEN
            )

        account = get_object_or_404(Account, pk=pk)

        if account.status != "pending":
            return Response(
                {"error": "Only pending accounts can be approved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        account.status = "active"
        account.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "message": "Account approved successfully.",
                "account_number": account.account_number,
                "status": account.status
            },
            status=status.HTTP_200_OK
        )