
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile


def get_user_role(user):
    """
    Return the correct role for a user.
    Django superusers always receive administrator access.
    """

    if user.is_superuser:
        return "administrator"

    profile = getattr(user, "profile", None)

    if profile:
        return profile.role

    return "customer"


class RegisterSerializer(serializers.ModelSerializer):

    full_name = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True)

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "full_name",
            "email",
            "phone",
            "password",
            "password2"
        ]

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Email is already registered."
            )

        return value

    def validate(self, attrs):

        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({
                "password2": "Passwords do not match."
            })

        return attrs

    def create(self, validated_data):

        validated_data.pop("password2")

        full_name = validated_data.pop("full_name")
        phone = validated_data.pop("phone")
        password = validated_data.pop("password")
        email = validated_data.pop("email")

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=full_name
        )

        UserProfile.objects.create(
            user=user,
            phone=phone,
            role="customer"
        )

        return user

    def to_representation(self, instance):

        profile = getattr(instance, "profile", None)

        return {
            "message": "Registration successful!",
            "user": {
                "id": instance.id,
                "email": instance.email,
                "full_name": instance.first_name,
                "role": get_user_role(instance)
            }
        }


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):

    username_field = User.USERNAME_FIELD

    def validate(self, attrs):

        email = attrs.get("username", "").strip().lower()
        attrs["username"] = email

        data = super().validate(attrs)

        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "full_name": self.user.first_name,
            "role": get_user_role(self.user)
        }

        return data
