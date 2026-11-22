
from django.urls import path
from .views import BillPaymentView

urlpatterns = [
    path("", BillPaymentView.as_view(), name="bill-payments"),
]
