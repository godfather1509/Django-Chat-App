# consumers.py file is to implement logic and accept api request from client
from asgiref.sync import sync_to_async
import json
import jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import *
from urllib.parse import parse_qs
from .serializers import UserSerializer, UserListSerializer

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    # as we are inheriting AsyncWebsocketConsumer all the methods inside this class will be executed asynchronously
    async def connect(self): # this is async function
        # this method is called to establish websocket connection between client and server
        query_string = self.scope["query_string"] # here we take token from url
        # in websocket we cannot get query passed in url as string we need to use .scope to access url query
        # .scope() returns query in byte format
        # '"query_string" is keyword used to extract query'
        query_string=query_string.decode('utf-8')
        # here we convert byte token to string format
        params = parse_qs(query_string)
        # this turns string query into dictionary of key-value pairs
        token = params.get("token", [None])[0]
        # we extract token from created dictionary

        '''
        frontend will be sending request on url like '/?token=abcd1234'
        we will extract 'token=abcd1234' in byte format convert it to string and store it in dictionary in form of key-value pair
        '?' indicates query_string
        '''
        if token:
            # if token is passed in url then move forward
            try:
                decode_data = jwt.decode(
                    token, settings.SECRET_KEY, algorithms=["HS256"]
                )
                # this line decodes and verifies data inside JWT token 
                # channels doesn't have DRF's 'authentication classes' so we have to decode token manually
                # JWT token is sent as random string actual token info has to to be extracted from it 
                # commonly "HS256" algorithm is used to decode the string
                # token string is signed by 'settings.SECRET_KEY' it indicates that sent token is real and untampered
                # decode_data is dictionary it has user_id of User provided by JWT token
                self.user = await sync_to_async(User.objects.get)(
                    id=decode_data["user_id"]
                )  # get user from user_id
                # User.objects.get is a regular (synchronous) Django ORM query.
                # Since we're inside an async function (connect), we use sync_to_async
                # to run this blocking query without freezing the event loop.
                self.scope["user"] = self.user # It sets the authenticated user in the WebSocket scope 
                # by doing this we can access 'user' easily anywhere in program
                # In Django Channels, self.scope is like the WebSocket version of a Django request object.
                # It stores metadata about the connection: path, user, headers, etc.

            except jwt.ExpiredSignatureError:
                # on decoding the token string if program finds token is expired
                await self.close(code=4000)  # close the connection if token is expired
                return
            except jwt.InvalidTokenError:
                # on decoding the token string if program finds token is invalid
                await self.close(
                    code=4001
                )  # close the connection if no token is invalid
                return
        else:
            await self.close(code=4002)  # close the connection if no token is provided
            return
        # all this was just for validating and getting user from database 
        
        # for setting up public websocket connection only conversation_id and room_group_name needs to be set

        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        # Get 'conversation_id' from the WebSocket URL path using scope
        # scope → url_route → kwargs → conversation_id
        self.room_group_name = f"chat_{self.conversation_id}"
        # name group name as conversation_id
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        # Add this WebSocket connection (identified by channel_name) and group_name(conversation_id) to channel_layer 
        # if some other user with same group_name(conversation_id) is added to channel_layer() then both will become part of same group/conversation
        await self.accept() # await will pause the program execution till instruction is executed
        # accept connection to client

        user_data = await self.get_user_data(self.user)
        # retrieve user data using helper funtion from database

        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "online_status", "online_users": [user_data], "status": "online"},
        ) # sending data to client
        # after connection is succesful we send all the users online(users currently added in group/channel_layer) to client

    async def disconnect(self, close_code):
        # this method is called to disconnect server with client
        if hasattr(self, "room_group_name"):
            # this checks if 'self' instance has a attribute named 'room_group_name'
            # this is an additional check to make sure user is connected before trying to disconnect
            user_data = await self.get_user_data(self.scope["user"])
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "online_status",
                    "online_users": [user_data],
                    "status": "offline",
                },
            )
            # send user_data to frontend(client) with status indicating offline
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
            # disconnect server and client

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        # convert text_data to json
        event_type = text_data_json.get("type")
        # get event type from sent data

        if event_type == "chat_message":
            # user is sendind message
            message_content = text_data_json.get("message")
            # retrieve message from text_data
            user_id = text_data_json.get("user")
            # get the user id from sent data
            try:
                user = await self.get_user(user_id)
                # get user from 'self' using user_id
                conversation = await self.get_conversation(self.conversation_id)
                # get conversation from conversation_id stored while connecting
                user_data = UserSerializer(user).data
                # get user_data from retrived user_id
                message = await self.save_message(conversation, user, message_content)
                # save message and other detais to message model
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": message.content,
                        "user": user_data,
                        "time_stamp": message.time_stamp.isoformat(),
                    },
                )
                # send received message content to frontend along with timestamp
            except Exception as e:
                print(e)

        elif event_type == "typing":
            # if user is typing message
            try:
                user_data = await self.get_user_data(self.scope["user"])
                # retrive user_id from .scope()
                receiver_id = text_data_json.get("receiver_id")
                # get receiver_id from sent text_data

                if receiver_id is not None:
                    # receiver_id is sent
                    if isinstance(receiver_id, (str, int, float)):
                        # this checks if receiver_id is in requierd format (string, number, or decimal) 
                        # if id is in list or dictionary then it can cause problem
                        receiver_id = int(receiver_id)
                        # typecast receiver id to int

                        if receiver_id != self.scope["user"].id:
                            # if both ids are not equal meaning there are 2 people in conversation
                            print(
                                f" User is typing for receiver:{receiver_id}"
                            )
                            await self.channel_layer.group_send(
                                self.room_group_name,
                                {
                                    "type": "typing",
                                    "user": user_data,
                                    "receiver": receiver_id,
                                },
                            )
                            # send user status to frontend
                        else:
                            print(f"{receiver_id['username']} is typing for themselves")
                            # if both id's are same it means only 1 person is there in conversation
                    else:
                        print(f"Invalid receiver ID:{type(receiver_id)}")
                        # receiver is not participant of this conversation
                else:
                    # receiver id not provided by frontend
                    print("No receiver id provided")
            except ValueError as e:
                print("Error getting user data:", e)

    # helper function
    async def chat_message(self, event):
        message = event["message"]
        # get message content
        user = event["user"]
        # get user
        time_stamp = event["time_stamp"]
        # get time stamp

        await self.send(
            text_data=json.dumps(
                {
                    "type": "chat_message",
                    "message": message,
                    "user": user,
                    "time_stamp": time_stamp,
                }
            )
            # convert python data into json
        )
        # send JSON message to frontend

    async def typing(self, event):
        user = event["user"]
        # get user 
        receiver_id = event.get("receiver")
        # get receiver
        is_typing = event.get("is_typing", False)
        # get is_typing by default it is set False
        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing",
                    "user": user,
                    "receiver": receiver_id,
                    "is_typing": is_typing,
                }
            )
            # convert python text data into json
        )
        # send JSON data to frontend

    async def online_status(self, event):
        # sends status of user whether online or offline to frontend
        await self.send(text_data=json.dumps(event))

    @sync_to_async
    def get_user(self, user_id):
        # retrieve user from User table
        return User.objects.get(id=user_id)

    @sync_to_async
    def get_user_data(self, user):
        # retrieve user data from db
        return UserListSerializer(user).data

    @sync_to_async
    def get_conversation(self, conversation_id):
        # get conversation from db using conversation_id
        try:
            # return Conversation using conversation_id
            return Conversation.objects.get(id=conversation_id)

        except Conversation.DoesNotExist:
            # raised when conversation with given id does not exist
            print(f"Conversation with id {conversation_id} does not exist")
            return None

    @sync_to_async
    def save_message(self, conversation, user, content):
        # save message to db
        return Message.objects.create(
            conversation=conversation,
            sender=user,
            content=content,
        )
