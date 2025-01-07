from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics,viewsets, filters,status
from .models import *
from fns import send_email,generate_auth_code,verify_code
from knox.models import AuthToken # type: ignore
from knox.auth import TokenAuthentication
from .serializers import *
import json
from rest_framework.permissions import AllowAny
from rest_framework.decorators import authentication_classes,action, permission_classes
from account.models import User
from django.db.models import Q

class ProjectView(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'name',
        'description'
        'creator__email',
        'creator__last_name',
        'creator__first_name',
        'lecturer__email',
        'creator__department__name',
        'lecturer__department__name',
        'advisor__email',
        'advisor__department__name',
        'tags__name',
    ]
    # @action(detail=False, methods=['create'], permission_classes=[IsAuthenticated],authentication_classes=[TokenAuthentication])
    def create(self, request, *args, **kwargs):
        data = request.data.copy()  
        data['creator'] = request.user.id  
        serializer = self.get_serializer(data=data)  
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(serializer.data, status=status.HTTP_201_CREATED)  # Return the response
    
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class TypesRetrieve(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):

        types = ProjectTypes.objects.all()
        toReturn = []
        for t in types:
            toReturn.append({'name':t.name,'id':t.id})

        return Response(toReturn, status=status.HTTP_200_OK)

class ProjectOpenView(viewsets.ModelViewSet):
    authentication_classes = []
    permission_classes = []
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'name',
        'description'
        'creator__email',
        'creator__last_name',
        'creator__first_name',
        'lecturer__email',
        'creator__department__name',
        'lecturer__department__name',
        'advisor__email',
        'advisor__department__name',
        'tags__name',
    ]
    def create(self, request, *args, **kwargs):
        return Response({'error':'not_allowed'},status=status.HTTP_403_FORBIDDEN)
    
    def update(self, request, *args, **kwargs):
        return Response({'error':'not_allowed'},status=status.HTTP_403_FORBIDDEN)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serialized_data = self.get_serializer(queryset, many=True).data
        modified_data = [self.modify_data(item) for item in serialized_data] # type: ignore
        return Response(modified_data,200)

    def retrieve(self, request, *args, **kwargs):
        serialized_data = self.get_serializer(self.get_object()).data
        modified_data = self.modify_data2(serialized_data)
        return Response(modified_data,200)
    
    def modify_data(self, item):
        related_obj = Project.objects.get(pk=item['id'])
        try:
            creator= User.objects.get(pk=item['creator'])
            item['creator'] = str(creator.first_name + ' ' + creator.last_name)
        except:
            pass
        try:
            project_type = ProjectTypes.objects.get(pk=item['project_type'])
            item['project_type'] = {
                'name':project_type.name,
                'new':project_type.newFlag
                }
        except:
            pass
        try:
            tags = []
            for t in item['tags']:
                tag = Tags.objects.get(pk=t)
                tags.append({
                    'name':tag.name,
                    'id':t
                })
            item['tags'] = tags
        except:
            pass
        item['collaborators'] = len(item['collaborators'])
        item['comments'] = len(item['comments'])
        item['likes'] = len(item['likes'])
        return item
    
    def modify_data2(self, item):
        related_obj = Project.objects.get(pk=item['id'])
        try:
            creator= User.objects.get(pk=item['creator'])
            item['creator'] = str(creator.first_name + ' ' + creator.last_name)
        except:
            pass
        try:
            project_type = ProjectTypes.objects.get(pk=item['project_type'])
            item['project_type'] = {
                'name':project_type.name,
                'new':project_type.newFlag
                }
        except:
            pass
        try:
            tags = []
            for t in item['tags']:
                tag = Tags.objects.get(pk=t)
                tags.append({
                    'name':tag.name,
                    'id':t
                })
            item['tags'] = tags
        except:
            pass
        item['collaborators'] = len(item['collaborators'])
        item['comments'] = len(item['comments'])
        item['likes'] = len(item['likes'])
        try:
            item['collaborators_data'] = [
                {
                    'name': str(col.first_name + col.last_name),
                    'email': col.email,
                    'is':col.id
                } for col in related_obj.collaborators
            ]
        except:
            pass
        likes_data = []
        try:
            for like in related_obj.likes:
                if like.user != None:
                    likes_data.append({
                        'name': str(like.user.first_name + like.user.last_name),
                        'email': like.user.email,
                        'id': like.user.id
                    })
                else:
                    likes_data.append({
                        'name':'',
                        'email':'',
                        'id':''
                    })
        except:
            pass

        item['likes_data'] = likes_data
        return item
    
class SearchAPIView(APIView):
    def get(self, request):
        pass
        # Retrieve the search query from request parameters
        query = request.query_params.get('search', '').strip()

        if not query:
            return Response({"error": "Search query is required"}, status=status.HTTP_400_BAD_REQUEST)

        # # Search through the related many-to-many field
        results = Project.objects.filter(
            Q(name__icontains=query),

            # Q(related_field__name__icontains=query)  # Adjust 'related_field' and 'name' as per your model
        ).distinct()

        # # Serialize the results
        # serializer = YourModelSerializer(results, many=True)

        # return Response(serializer.data, status=status.HTTP_200_OK)

class LikedItem(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self,request):
        try:
            type = request.data['type']
            id = request.data['id']
        except:
            return Response({'error':'Missing informations'},status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if(type=='project'):
            project = Project.objects.get(pk=id)
            if len(project.likes.filter(user=user.pk))>0:
                like = project.likes.filter(user=user.pk).last()
                project.likes.remove(like)
            else:
                newlike = Likes.objects.create(user=user)
                project.likes.add(newlike)
            project.save()
        return Response({'message':'success'},201)

class OpenLikedItem(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self,request):
        try:
            id = request.data['id']
            liked = request.data['liked']
            type = request.data['type']
        except:
            return Response({'error':'Missing informations'},status=status.HTTP_400_BAD_REQUEST)
        if(type=='project'):
            project = Project.objects.get(pk=id)
            if liked and project.likes.filter():
                like = project.likes.filter().last()
                project.likes.remove(like)
            else:
                newlike = Likes.objects.create()
                project.likes.add(newlike)
                project.save()

        return Response({'message':'success'},201)
