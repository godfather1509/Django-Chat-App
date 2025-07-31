from django.contrib import admin
from django.urls import path, include
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [

    path('auth/register/', CreateUser.as_view(), name='register'),
    # create new user
    path('users/', UserListView.as_view(), name='user-list'),
    # this will return list of users
    path('get_user/',get_user),
    # get simgle user
    path('auth/token/', TokenObtainPairView.as_view(),name='token_obtain_pair'),
    # this will take user credentials and return auth token
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # we shall send refresh token here and get authentication token after it is expired
    path('conversations/',ConversationListCreateView.as_view(), name='conversations_list'),
    # this is to create new conversation
    path('conversations/<int:conversation_id>/messages/', MessageListCreateView.as_view(), name='message_list_create'),
    # GET or POST message to 1 conversation
    path('conversations/<int:conversation_id>/messages/<int:pk>',MessageRetrieveDestroyView.as_view(), name='message_list_destroy')
]
