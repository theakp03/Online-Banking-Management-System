from django.urls import path

from .views import (
    AccountListCreateView,
    AccountDetailView,
    ApproveAccountView,
)

urlpatterns = [
    path("", AccountListCreateView.as_view(), name="account-list-create"),

    path("<int:pk>/", AccountDetailView.as_view(), name="account-detail"),

    path(
        "<int:pk>/approve/",
        ApproveAccountView.as_view(),
        name="approve-account"
    ),
]