from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    # This serializer is to create users
    class Meta:
        # defines meta data
        model = User
        fields = ("username", "password","email")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"], password=validated_data["password"],email=validated_data["email"]
        )
        return user


class UserListSerializer(serializers.ModelSerializer):
    # this class is to get and post users
    class Meta:
        model = User
        fields = ("id", "username","email")


class ConversationSerializer(serializers.ModelSerializer):
    # serializes conversation object to save in db
    participants = UserListSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ("id", "participants", "created_at")

    def to_representation(self, instance):
        # this customizes how our serialized output will look like
        representation = super().to_representation(instance)
        return representation


class MessageSerializer(serializers.ModelSerializer):
    # serializes message to send to frontend
    sender = UserListSerializer()
    participants = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            "id",
            "conversation",
            "sender",
            "content",
            "time_stamp",
            "participants",
        )

    def get_participants(self, obj):
        return UserListSerializer(obj.conversation.objects.all(), many=True).data


class CreateMessageSerializer(serializers.ModelSerializer):
    # creates Messagein db
    class Meta:
        model = Message
        fields = ("conversation", "content")
