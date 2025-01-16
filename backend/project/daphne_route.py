from django.urls import path
from . import consumers 

websocket_urlpatterns = [
    path('ws/<room_uuid>/$', consumers.Consumer.as_asgi()),
]