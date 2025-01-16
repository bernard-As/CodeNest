import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import *
class Consumer(AsyncWebsocketConsumer):
    file = None
    project = None
    presentation = None
    async def connect(self):
        id = self.scope['url_route']['kwargs']['id']
        self.file = Files.objects.get(pk=id)
        if(self.file!=None):
            await self.accept()

    async def disconnect(self, close_code):
        pass  

    async def receive(self, text_data):
        data = json.loads(text_data)  
        type = data['type']
        project = data['project']
        if(type=='checkups'):
            userId = data['id']
            user = User.objects.get(pk=userId)
            self.project = Project.objects.get(pk=project)
            if user  in self.project.collaborators() or user ==self.project.creator:
                self.presentation = Presentation.objects.get_or_create(
                    file=self.file,
                    host=user
                )
            else:
                try:
                    self.presentation = Presentation.objects.get(file=self.file.pk)
                except:
                    self.disconnect()

            if user not in self.project.collaborators() or user !=self.project.creator and self.presentation==None:
                self.disconnect()
            
        # Process the data and send a response
        await self.send(text_data=json.dumps({
            'message': 'Response message here'
        }))