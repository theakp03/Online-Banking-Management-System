
from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):

    list_display = (
        "transaction_id",
        "sender",
        "receiver",
        "amount",
        "transaction_type",
        "status",
        "created_at",
    )

    list_filter = (
        "transaction_type",
        "status",
        "created_at",
    )

    search_fields = (
        "transaction_id",
        "sender__account_number",
        "receiver__account_number",
    )

    readonly_fields = (
        "transaction_id",
        "created_at",
    )
