"""API views for messaging — conversations list, messages, send message."""

from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, SendMessageSerializer


class ConversationListView(generics.ListAPIView):
    """List all conversations for the authenticated user."""

    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = self.request.user.profile
        return Conversation.objects.filter(
            Q(profile_1=profile) | Q(profile_2=profile)
        ).select_related("profile_1__user", "profile_2__user").prefetch_related("messages")


class ConversationMessagesView(generics.ListAPIView):
    """List messages in a conversation."""

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = self.request.user.profile
        conversation_id = self.kwargs["conversation_id"]
        return Message.objects.filter(
            conversation_id=conversation_id,
            conversation__profile_1=profile,
        ) | Message.objects.filter(
            conversation_id=conversation_id,
            conversation__profile_2=profile,
        )

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        # Mark messages as read
        profile = request.user.profile
        Message.objects.filter(
            conversation_id=self.kwargs["conversation_id"],
            is_read=False,
        ).exclude(sender=profile).update(is_read=True)
        return response


class SendMessageView(APIView):
    """Send a message in a conversation."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, conversation_id):
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile = request.user.profile
        try:
            conversation = Conversation.objects.get(
                Q(profile_1=profile) | Q(profile_2=profile),
                id=conversation_id,
            )
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        message = Message.objects.create(
            conversation=conversation,
            sender=profile,
            text=serializer.validated_data["text"],
            media_url=serializer.validated_data.get("media_url", ""),
        )
        conversation.save()  # Update the updated_at timestamp

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
