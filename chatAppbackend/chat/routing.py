from django.urls import path
from .consumers import *


websocket_urlpatterns = [path("ws/chat/<int:conversation_id>/", ChatConsumer.as_asgi())]
