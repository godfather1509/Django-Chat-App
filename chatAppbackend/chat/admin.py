from django.contrib import admin
from .models import Conversation, Message


# Register your models here.


class MessageLine(admin.TabularInline):
    model = Message
    extra = 3


class ConversationAdmin(admin.ModelAdmin):
    list_display = ("get_participants", "created_at")
    inlines = [MessageLine]


admin.site.register(Conversation, ConversationAdmin)
admin.site.register(Message)
