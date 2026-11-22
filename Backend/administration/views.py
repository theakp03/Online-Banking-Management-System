
from django.contrib.auth.models import User
from django.db.models import Count, Sum
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from users.models import UserProfile
from users.permissions import IsAdministrator

from accounts.models import Account
from loans.models import Loan
from transactions.models import Transaction


class AdministratorOverviewView(APIView):
    permission_classes = [IsAdministrator]

    def get(self, request):
        role_counts = {
            item["role"]: item["total"]
            for item in UserProfile.objects.values("role").annotate(
                total=Count("id")
            )
        }

        account_counts = {
            item["status"]: item["total"]
            for item in Account.objects.values("status").annotate(
                total=Count("id")
            )
        }

        loan_counts = {
            item["status"]: item["total"]
            for item in Loan.objects.values("status").annotate(
                total=Count("id")
            )
        }

        total_balance = (
            Account.objects.filter(status="active").aggregate(
                total=Sum("balance")
            )["total"] or 0
        )

        data = {
            "total_users": User.objects.count(),
            "active_users": User.objects.filter(is_active=True).count(),
            "customers": role_counts.get("customer", 0),
            "banking_staff": role_counts.get("banking_staff", 0),
            "managers": role_counts.get("manager", 0),
            "administrators": role_counts.get("administrator", 0),

            "total_accounts": Account.objects.count(),
            "pending_accounts": account_counts.get("pending", 0),
            "active_accounts": account_counts.get("active", 0),
            "frozen_accounts": account_counts.get("frozen", 0),
            "closed_accounts": account_counts.get("closed", 0),

            "total_balance": str(total_balance),

            "total_loans": Loan.objects.count(),
            "pending_loans": loan_counts.get("pending", 0),
            "approved_loans": loan_counts.get("approved", 0),
            "rejected_loans": loan_counts.get("rejected", 0),

            "total_transactions": Transaction.objects.count(),
        }

        return Response(data, status=status.HTTP_200_OK)


class AdministratorUserListView(APIView):
    permission_classes = [IsAdministrator]

    def get(self, request):
        users = User.objects.select_related("profile").order_by("-date_joined")

        result = []

        for user in users:
            profile = getattr(user, "profile", None)

            result.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": profile.role if profile else "unassigned",
                "phone": profile.phone if profile else "",
                "is_active": user.is_active,
                "date_joined": user.date_joined,
            })

        return Response(result, status=status.HTTP_200_OK)


class AdministratorChangeUserRoleView(APIView):
    permission_classes = [IsAdministrator]

    def patch(self, request, user_id):
        new_role = request.data.get("role")

        valid_roles = [
            choice[0] for choice in UserProfile.ROLE_CHOICES
        ]

        if new_role not in valid_roles:
            return Response(
                {
                    "error": "Invalid role.",
                    "valid_roles": valid_roles,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_user = get_object_or_404(User, id=user_id)

        # Prevent an administrator from accidentally removing
        # their own administrator access.
        if target_user.id == request.user.id:
            return Response(
                {"error": "You cannot change your own role."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Do not change the role of Django superuser accounts here.
        if target_user.is_superuser:
            return Response(
                {"error": "The role of a superuser cannot be changed here."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile, created = UserProfile.objects.get_or_create(
            user=target_user,
            defaults={"role": "customer"},
        )

        profile.role = new_role
        profile.save(update_fields=["role"])

        return Response(
            {
                "message": "User role updated successfully.",
                "user_id": target_user.id,
                "username": target_user.username,
                "role": profile.role,
            },
            status=status.HTTP_200_OK,
        )
