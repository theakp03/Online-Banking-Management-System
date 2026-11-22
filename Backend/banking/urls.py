from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/users/', include('users.urls')),
    path("api/accounts/", include("accounts.urls")),
    path("api/transactions/", include("transactions.urls")),
    path("api/loans/", include("loans.urls")),
    path("api/loans/", include("loans.urls")),
    path("api/payments/", include("payments.urls")),
    path(
        "api/administration/",
        include("administration.urls")
    ),
]