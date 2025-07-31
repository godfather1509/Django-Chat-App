from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from .models import *
from .serializers import *


class CreateUser(generics.CreateAPIView):
    # this is to create user as 'CreateAPIView' allows only POST request by default
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserListView(generics.ListAPIView):
    # this is to get users, 'ListAPIView' allows only GET request
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    users=request.user
    serializer=UserListSerializer(users)
    return Response(serializer.data)

class ConversationListCreateView(generics.ListCreateAPIView):
    # 'ListCreateAPIView' allows only GET and POST requests so we can here only get or send conversation
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # this function is called when we hit GET request
        # it returns all conversations where the authenticated user is a participant
        participants = self.request.user
        return Conversation.objects.filter(participants=participants).prefetch_related(
            "participants"
        )
        # this query returns all conversations where the authenticated user (participant) is involved
        # and also preloads all other participants in those conversations as well

    def create(self, request, *args, **kwargs):
        # this method creates Conversation object

        participant_data = request.data.get(
            "participants", []
        )  # frontend will be sending user ids in api data
        print(participant_data)
        if len(participant_data) != 2:
            # conversation must happens amongst 2 users only
            return Response(
                {
                    "error": "A Conversation needs 2 participants",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        users = User.objects.filter(id__in=participant_data)
        # get users with matching ids in User table
        # '__' is lookup expression it is used in filtering to use advance query options
        # id__in=participant_data: Give me all 'User' objects where their 'id is in' the participant_data list
        if users.count() != 2:
            # Validates both user IDs exist in the database.
            return Response(
                {
                    "error": "Participants do not exist",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_conversation = Conversation.objects.filter(participant__id=participant_data[0])\
            .filter(participants__id=participant_data[1])\
            .distinct()
        # Checks and gets if a conversation with both users already exists in db
        if existing_conversation.exists():
            # if converstion already exists no need to create it
            return Response(
                {"error": "Conversation Already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if(users.count()>=2):
            conversation = Conversation.objects.create()
            # as conversation does not exists create conversation
            conversation.participants.set(users)
            # set the users as participants of conversation
            serializer = ConversationSerializer(conversation)
            # serialize conversation to send to frontend
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class MessageListCreateView(generics.ListCreateAPIView):
    # this class is to handel GET as well POST request

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # this method returns all the messages in the conversation
        conversation_id = self.kwargs["conversation_id"] # self.kwargs[] is used to retrieve data sent in url
        # get conversation_id from url
        conversation = self.get_conversation(conversation_id)
        # get conversation from db
        return conversation.messages.order_by("time_stamp")
        # returns all the messages in conversation sorted as per times

    def get_serializer_class(self):
        # returns serializer class as per request sent by frontend
        if self.request.method == "POST":
            return CreateMessageSerializer
            # this serializer creates and saves message to model as frotend is sending message
        return MessageSerializer
        # this returns all the messages to frontend

    def perform_create(self, serializer):
        # this method creates instance of Message model
        print("Incoming conversation", self.request.data)
        conversation_id = self.kwargs["conversation_id"]
        # get the conversation id
        conversation = self.get_conversation(conversation_id)
        # get the conversation from conversation_id
        serializer.save(sender=self.request.user, conversation=conversation)
        # saves the message to conversation

    def get_conversation(self, conversation_id):
        # this method gets Conversation model id as conversation_id
        conversation = get_object_or_404(Conversation, id=conversation_id)
        # gets the Conversation object associated with passed conversation_id
        if self.request.user not in conversation.participants.all():
            # if authenticated user is not part of the conversation then raise error
            raise PermissionDenied("User not in Conversation")
        return conversation
        # return conversation


class MessageRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    # 'RetrieveDestroyAPIView' class provides GET and DELETE functionality for single object(will delete single message)
    # this class is for deleting the messages from conversation
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer # declare serializer object

    def get_queryset(self):
        # this method is to retrieve message instance
        conversation_id = self.kwargs["conversation_id"]
        # get the conversation_id from url
        return Message.objects.filter(conversation_id=conversation_id)
        # gets all the messages in Conversation
        # DRF automatically filters out requierd single message on the basis message_id sent in url

    def perform_destroy(self, instance):
        # this method is to DELETE message instance
        if instance.sender != self.request.user:
            # check if person deleting the message is participant of conversation
            raise PermissionDenied("User not in Conversation")
        instance.delete()
        # delete the message instance
        return Response(status=status.HTTP_204_NO_CONTENT)