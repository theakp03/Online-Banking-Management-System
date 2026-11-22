
from django.urls import path
from .views import FundTransferView, TransactionHistoryView

urlpatterns = [
    path(
        "transfer/",
        FundTransferView.as_view(),
        name="fund-transfer"
    ),

    path(
        "history/",
        TransactionHistoryView.as_view(),
        name="transaction-history"
    ),
]
