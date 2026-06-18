"""API views for notifications."""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """List all notifications for the authenticated user."""

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(profile=self.request.user.profile)


class MarkReadView(APIView):
    """Mark a notification as read."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id, profile=request.user.profile
            )
        except Notification.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response({"message": "Marked as read"})


class MarkAllReadView(APIView):
    """Mark all notifications as read."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            profile=request.user.profile, is_read=False
        ).update(is_read=True)
        return Response({"message": "All notifications marked as read"})


class UnreadCountView(APIView):
    """Get unread notification count."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            profile=request.user.profile, is_read=False
        ).count()
        return Response({"unread_count": count})
