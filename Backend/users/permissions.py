
from rest_framework.permissions import BasePermission


class BaseRolePermission(BasePermission):
    """
    Base permission class for banking system roles.
    """

    allowed_roles = []

    def has_permission(self, request, view):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Superusers have administrator-level access
        if user.is_superuser:
            return True

        profile = getattr(user, "profile", None)

        if profile is None:
            return False

        return profile.role in self.allowed_roles


# Individual role permissions

class IsCustomer(BaseRolePermission):
    allowed_roles = ["customer"]


class IsBankingStaff(BaseRolePermission):
    allowed_roles = ["banking_staff"]


class IsManager(BaseRolePermission):
    allowed_roles = ["manager"]


class IsAdministrator(BaseRolePermission):
    allowed_roles = ["administrator"]


# Combined role permissions

class IsBankingStaffOrAbove(BaseRolePermission):
    allowed_roles = [
        "banking_staff",
        "manager",
        "administrator"
    ]


class IsManagerOrAdministrator(BaseRolePermission):
    allowed_roles = [
        "manager",
        "administrator"
    ]


class IsCustomerOrAbove(BaseRolePermission):
    allowed_roles = [
        "customer",
        "banking_staff",
        "manager",
        "administrator"
    ]
