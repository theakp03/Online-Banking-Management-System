from django.urls import path
from .views import FundTransferView

urlpatterns = [
    path(
        "transfer/",
        FundTransferView.as_view(),
        name="fund-transfer"
    ),
]