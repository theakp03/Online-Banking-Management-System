
from django.urls import path

from .views import (
    AdministratorOverviewView,
    AdministratorUserListView,
    AdministratorChangeUserRoleView,
)

urlpatterns = [
    path(
        "overview/",
        AdministratorOverviewView.as_view(),
        name="administrator-overview",
    ),
    path(
        "users/",
        AdministratorUserListView.as_view(),
        name="administrator-users",
    ),
    path(
        "users/<int:user_id>/role/",
        AdministratorChangeUserRoleView.as_view(),
        name="administrator-change-user-role",
    ),
]
