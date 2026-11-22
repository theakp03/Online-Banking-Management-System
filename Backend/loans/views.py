
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.exceptions import PermissionDenied

from .models import Loan
from .serializers import LoanSerializer


def get_user_role(user):
    if user.is_superuser:
        return "administrator"

    profile = getattr(user, "profile", None)

    return profile.role if profile else None


class LoanListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        role = get_user_role(request.user)

        if role in ["banking_staff", "manager", "administrator"]:
            loans = Loan.objects.all()

        elif role == "customer":
            loans = Loan.objects.filter(user=request.user)

        else:
            raise PermissionDenied("Invalid user role.")

        loans = loans.select_related(
            "user", "account", "reviewed_by"
        ).order_by("-created_at")

        serializer = LoanSerializer(loans, many=True)

        return Response({
            "count": loans.count(),
            "loans": serializer.data
        })

    def post(self, request):

        if get_user_role(request.user) != "customer":
            raise PermissionDenied(
                "Only customers can apply for loans."
            )

        serializer = LoanSerializer(
            data=request.data,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)

        serializer.save(user=request.user)

        return Response(
            {
                "message": "Loan application submitted successfully.",
                "loan": serializer.data
            },
            status=status.HTTP_201_CREATED
        )


class LoanReviewView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        role = get_user_role(request.user)

        if role not in [
            "banking_staff",
            "manager",
            "administrator"
        ]:
            raise PermissionDenied(
                "You are not authorized to review loans."
            )

        try:
            loan = Loan.objects.get(pk=pk)
        except Loan.DoesNotExist:
            return Response(
                {"error": "Loan application not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if loan.status != "pending":
            return Response(
                {"error": "This loan has already been reviewed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        decision = request.data.get("decision")
        remarks = request.data.get("remarks", "")

        if decision not in ["approved", "rejected"]:
            return Response(
                {"error": "Decision must be approved or rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        loan.status = decision
        loan.remarks = remarks
        loan.reviewed_by = request.user
        loan.reviewed_at = timezone.now()

        loan.save()

        return Response({
            "message": f"Loan {decision} successfully.",
            "loan": LoanSerializer(loan).data
        })
