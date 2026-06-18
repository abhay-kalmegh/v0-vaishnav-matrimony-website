"""Serializers for messaging app."""

from rest_framework import serializers
from apps.profiles.serializers import ProfileListSerializer
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source="sender.user.full_name")

    class Meta:
        model = Message
        fields = ["id", "sender", "sender_name", "text", "media_url", "is_read", "sent_at"]
        read_only_fields = ["id", "sender", "is_read", "sent_at"]


class ConversationSerializer(serializers.ModelSerializer):
    other_profile = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "other_profile", "last_message", "unread_count", "created_at", "updated_at"]

    def get_other_profile(self, obj):
        request_profile = self.context["request"].user.profile
        other = obj.profile_2 if obj.profile_1 == request_profile else obj.profile_1
        return ProfileListSerializer(other, context=self.context).data

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-sent_at").first()
        if msg:
            return MessageSerializer(msg).data
        return None

    def get_unread_count(self, obj):
        request_profile = self.context["request"].user.profile
        return obj.messages.filter(is_read=False).exclude(sender=request_profile).count()


class SendMessageSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=2000)
    media_url = serializers.URLField(required=False, allow_blank=True)
