from django.db import models
from django.contrib.auth.models import User
from django.db.models import Prefetch
from django.core.exceptions import ValidationError


class ConversationManager(models.Manager):
    # custom manager class for Conversation model

    def get_queryset(self):
        # overiding default get_queryset() function
        users = User.objects.only("id", "username")
        # when we do this we are fetching only 'id' and 'username' of user reducing data size and making query faster
        conversations = super().get_queryset()
        # gets all the conversations from DB
        data = conversations.prefetch_related(Prefetch("participants", queryset=users))
        # gets all the participants(users) of each conversations along with conversation but gets only 'username' and 'id' of each user
        # this speeds up the query and saves cache
        # Passing "participants" to Prefetch(...), tells Django which related field to prefetch.
        """ 
        data = conversations.prefetch_related(Prefetch("participants", queryset=users))
        This line tells program: while you're fetching all the conversations, also fetch the participants for each one — in one separate, 
        optimized query — and store them in memory so I don’t have to hit the DB again

        This will work with fields related to or belonging to main model it won't get random arbitary fields not related to model "participants"
        is field belonging to model
        """
        return data


class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name="conversation")
    # when multiple of objects from 1 model are related to multiple objects from another model we use Many-to-Many relationship
    created_at = models.DateTimeField(auto_now=True)
    objects = ConversationManager()

    def __str__(self):
        username = []
        users = self.participants.all()
        # this fetches all the users involved in conversation
        for user in users:
            username.append(user.username)

        participants_names = ", ".join(username)
        # this joins all the usernames in username list into single string
        return f"Conversation with {participants_names}"

    def get_participants(self):
        username = []
        users = self.participants.all()
        for user in users:
            username.append(user.username)
        participants_names = ", ".join(username)
        return participants_names

class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    time_stamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Message from {self.sender.username}"
