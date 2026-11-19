from django.contrib import admin
from .models import Account

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = (
    "account_number",
    "user",
    "balance",
    "status",
    )

    search_fields = (
    "account_number",
    "user__username",
    )

    list_filter = ("status",)
    pass