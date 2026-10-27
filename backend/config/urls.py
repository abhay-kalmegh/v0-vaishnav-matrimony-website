"""Root URL Configuration for Vaishnav Vivaah."""

from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.accounts.health import health

urlpatterns = [
    path(settings.ADMIN_URL, admin.site.urls),
    path("api/health/", health, name="health"),
    # App APIs
    path("api/auth/", include("apps.accounts.urls")),
    path("api/profile/", include("apps.profiles.urls")),
    path("api/spirituality/", include("apps.spirituality.urls")),
    path("api/matches/", include("apps.matches.urls")),
    path("api/interests/", include("apps.interests.urls")),
    path("api/messages/", include("apps.messaging.urls")),
    path("api/events/", include("apps.events.urls")),
    path("api/subscriptions/", include("apps.subscriptions.urls")),
    path("api/verification/", include("apps.verification.urls")),
    path("api/success-stories/", include("apps.success_stories.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
]

if settings.DEBUG:
    # API schema / Swagger UI are development tools, not public production endpoints.
    urlpatterns += [
        path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
        path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
