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
import os
import shutil
import subprocess
from django.conf import settings


class ProjectView(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'name',
        'description',
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
    
    def retrieve(self, request, *args, **kwargs):
        project = self.get_object()
        user = request.user
        if user not in project.collaborators.all() and  user.pk != project.creator.pk:
            return Response({'message':'not allowed'}, status=status.HTTP_403_FORBIDDEN)
        isProjectOwner = user.pk == project.creator.pk
        return Response({
            'isAllowed': True,
            'isProjectOwner':isProjectOwner,
            'isCollaborator': not isProjectOwner
        }, status=status.HTTP_200_OK)
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
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
        'description',
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
    
    def patch(self, request, *args, **kwargs):
        return Response({'error':'not_allowed'},status=status.HTTP_403_FORBIDDEN)
    
    def put(self, request, *args, **kwargs):
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
                'new':project_type.newFlag,
                'id':project_type.pk
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
            for like in related_obj.likes.all():
                if like.user != None:
                    likes_data.append({
                        'name': str(like.user.first_name + like.user.last_name),
                        'email': like.user.email,
                        'id': like.user.id
                    })
                else:
                    likes_data.append({
                        'name':'Unknow',
                        'email':'',
                        'id':''
                    })
            item['likes_data'] = likes_data
        except:
            pass
        comment_data = []
        try:
            for comment in related_obj.comments.all():
                image=None
                name  = 'Unknown'
                if comment.user!=None and comment.user.image!=None:
                    image = comment.user.image.url
                    name = str(comment.user.first_name + comment.user.last_name)
                comment_data.append({
                    'text':comment.text,
                    'image':image,
                    'name':name

                })
            item['comments_data'] = comment_data
        except:
            pass
        item['likes_data'] = likes_data
        item['structure'] = []
        # try:
        project_folder = related_obj.project_folder.all().order_by('name')
        folders_data = [self.folderLoop(folder) for folder in project_folder]
        item['structure'] = {'type':'folder',
                             'subfolders':folders_data,
                             'name':related_obj.name,
                             'files':[]
                             }
        project_item = related_obj.project_file.all().order_by('file')
        project_item_serialized = FilesSerializer(project_item,many=True)
        for file in project_item_serialized.data:
            file_obj = Files.objects.get(pk=file['id'])
            item['structure']['files'].append({
                'type':'file',
                'id': file['id'],
                'file':file['file'] ,  # URL to access the file
                'name':file_obj.file.name,
                'timestamp': file_obj.timestamp.isoformat(),
                'tags': [tag.name for tag in file_obj.tags.all()],  # Assuming Tags has a 'name' field
                'comments': [comment.text for comment in file_obj.comments.all()]  # Assuming Comment has a 'text' field
            })
        # except:
            # pass

        
        return item
    def folderLoop(self,folder):
            """Recursively serialize a folder and its contents."""
            folder_data = {
                'type':'folder',
                'id': folder.id,
                'name': folder.name,
                'timestamp': folder.timestamp.isoformat(),
                'files': [],
                'subfolders': []
            }

            # Get all files in the current folder
            files = folder.files_set.all()
            serialized_files = FilesSerializer(files,many=True)
            for file in serialized_files.data:
                file_obj = Files.objects.get(pk=file['id'])
                folder_data['files'].append({
                    'id': file['id'],
                    'file':file['file'] ,  # URL to access the file
                    'name':file_obj.file.name,
                    'timestamp': file_obj.timestamp.isoformat(),
                    'tags': [tag.name for tag in file_obj.tags.all()],  # Assuming Tags has a 'name' field
                    'comments': [comment.text for comment in file_obj.comments.all()]  # Assuming Comment has a 'text' field
                })
            # Get all subfolders
            subfolders = folder.subfolders.all()
            for subfolder in subfolders:
                folder_data['subfolders'].append(self.folderLoop(subfolder))

            return folder_data

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

class FolderView(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'name',
    ]

class OpenFolderView(viewsets.ModelViewSet):
    authentication_classes = []
    permission_classes = []
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'name',
    ]
    def create(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)
    def update(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)
    def put(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)
    def patch(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    def retrieve(self, request, *args, **kwargs):
        queryset = self.get_object()
        serialized_data = self.get_serializer(queryset,).data
        modified_data = self.modify_data(serialized_data)
        return Response(modified_data,200)
    def modify_data(self,item):
        related_obj = Folder.objects.get(pk=item['id'])
        files = related_obj.files_set.all()
        print(files)
        return item

class FileView(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Files.objects.all()
    serializer_class = FilesSerializer
    filter_backends = [filters.SearchFilter]
    
    def create(self, request, *args, **kwargs):
        try:
            project = Project.objects.get(pk=request.data['project'])
            files = request.FILES.getlist('files')
            folder = None
            try:
                folder = Folder.objects.get(pk=request.data['folder'])
            except:
                pass
            uploaded_files = []
            for file in files:
                data = {
                    'file':file
                }
                if(folder is not None):
                    data['folder'] = folder.pk
                else:
                    data['project'] = project.pk
                serializer = FilesSerializer(data=data)
                if serializer.is_valid():
                    serializer.save()
                    uploaded_files.append(serializer.data)
                else:
                    pass
        except:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return Response(status=status.HTTP_201_CREATED)

class OpenFileView(viewsets.ModelViewSet):
    authentication_classes = []
    permission_classes = []
    queryset = Files.objects.all()
    serializer_class = FilesSerializer
    filter_backends = [filters.SearchFilter]
    
    def create(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)
    def update(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)
    def put(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)
    def patch(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)

class CommentView(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_backends = [filters.SearchFilter]
    
    def create(self, request, *args, **kwargs):
        user = request.user
        comment = Comment.objects.create(user=user,text=request.data['text'])
        project = Project.objects.get(pk=request.data['project'])
        project.comments.add(comment)
        project.save()
        serialized = CommentSerializer(comment).data
        return Response(serialized, status=status.HTTP_201_CREATED)
    def update(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)
    def put(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)
    def patch(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)

class OpenCommentView(viewsets.ModelViewSet):
    authentication_classes = []
    permission_classes = []
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_backends = [filters.SearchFilter]
    
    def create(self, request, *args, **kwargs):
        comment = Comment.objects.create(text=request.data['text'])
        project = Project.objects.get(pk=request.data['project'])
        project.comments.add(comment)
        project.save()
        serialized = CommentSerializer(comment).data
        return Response(serialized, status=status.HTTP_201_CREATED)
    def update(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)
    def put(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)
    def patch(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)

class ExecuteCppView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        file_id = request.data.get('file_id')  # ID of the file in the database

        try:
            cpp_file = Files.objects.get(pk=file_id)
        except Files.DoesNotExist:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        original_file_path = cpp_file.file.path
        temp_file_path = os.path.join(settings.MEDIA_ROOT, 'temp', cpp_file.file.name)

        # Copy file to temporary location
        os.makedirs(os.path.dirname(temp_file_path), exist_ok=True)
        shutil.copy(original_file_path, temp_file_path)

        # Prepare paths
        executable_path = temp_file_path.replace('.cpp', '.out')

        try:
            # Compile the C++ file
            compile_process = subprocess.run(
                ['g++', temp_file_path, '-o', executable_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=10
            )
            compile_output = compile_process.stdout
            compile_error = compile_process.stderr

            if compile_process.returncode != 0:
                return Response({
                    'error': compile_error.strip(),
                    'output': compile_output.strip(),
                    'warning': 'Compilation failed.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Run the executable
            run_process = subprocess.run(
                [executable_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=10
            )
            runtime_output = run_process.stdout
            runtime_error = run_process.stderr

            response_data = {
                'output': runtime_output.strip(),
                'error': runtime_error.strip() if run_process.returncode != 0 else None,
                'warning': None if run_process.returncode == 0 else 'Runtime error occurred.'
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except subprocess.TimeoutExpired:
            return Response({
                'error': 'Execution timed out.',
                'output': None,
                'warning': 'The program took too long to execute.'
            }, status=status.HTTP_408_REQUEST_TIMEOUT)

        finally:
            # Cleanup temporary files
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            if os.path.exists(executable_path):
                os.remove(executable_path)

class ExecutePhpView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        file_id = request.data.get('file_id')  # ID of the PHP file in the database

        # Fetch the file from the database
        try:
            php_file = Files.objects.get(pk=file_id)  # Assuming the same model for PHP
        except Files.DoesNotExist:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        original_file_path = php_file.file.path
        temp_file_path = os.path.join(settings.MEDIA_ROOT, 'temp', php_file.file.name)

        # Copy file to temporary location
        os.makedirs(os.path.dirname(temp_file_path), exist_ok=True)
        shutil.copy(original_file_path, temp_file_path)

        try:
            # Execute the PHP file
            run_process = subprocess.run(
                ['php', temp_file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=10
            )
            runtime_output = run_process.stdout
            runtime_error = run_process.stderr

            response_data = {
                'output': runtime_output.strip(),
                'error': runtime_error.strip() if run_process.returncode != 0 else None,
                'warning': None if run_process.returncode == 0 else 'Runtime error occurred.'
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except subprocess.TimeoutExpired:
            return Response({
                'error': 'Execution timed out.',
                'output': None,
                'warning': 'The program took too long to execute.'
            }, status=status.HTTP_408_REQUEST_TIMEOUT)

        finally:
            # Cleanup temporary files
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)


class ExecuteFileView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        file_id = request.data.get('file_id')

        try:
            file_obj = Files.objects.get(pk=file_id)
        except Files.DoesNotExist:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        file_extension = os.path.splitext(file_obj.file.name)[1].lower()

        if file_extension == '.cpp':
            # Call C++ execution logic
            return ExecuteCppView().post(request)
        elif file_extension == '.php':
            # Call PHP execution logic
            return ExecutePhpView().post(request)
        else:
            return Response({'error': 'Unsupported file type'}, status=status.HTTP_400_BAD_REQUEST)
