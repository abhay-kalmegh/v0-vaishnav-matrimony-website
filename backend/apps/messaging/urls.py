"""URL routes for messaging API."""

from django.urls import path
from . import views

urlpatterns = [
    path("", views.ConversationListView.as_view(), name="conversation-list"),
    path("<uuid:conversation_id>/", views.ConversationMessagesView.as_view(), name="conversation-messages"),
    path("<uuid:conversation_id>/send/", views.SendMessageView.as_view(), name="send-message"),
]
