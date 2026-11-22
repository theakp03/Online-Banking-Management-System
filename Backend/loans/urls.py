
from django.urls import path
from .views import LoanListCreateView, LoanReviewView

urlpatterns = [
    path("", LoanListCreateView.as_view(), name="loan-list-create"),
    path(
        "<int:pk>/review/",
        LoanReviewView.as_view(),
        name="loan-review"
    ),
]
