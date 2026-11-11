from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes

@api_view(['GET'])
@permission_classes([AllowAny])
def home(request):

    return Response({
        "message": "Online Banking API is running!",
        "status": "success"
    })