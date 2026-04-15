"""
Views for BlogPost and BlogPostTranslation.
"""

from rest_framework import generics, status
from rest_framework.permissions import SAFE_METHODS, BasePermission
from rest_framework.response import Response

from .models import BlogPost, BlogPostTranslation
from .serializers import (
    BlogPostListSerializer,
    BlogPostSerializer,
    BlogPostTranslationSerializer,
)


class IsAuthenticatedOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class BlogPostListCreateView(generics.ListCreateAPIView):
    """List blog posts or create a new one."""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return BlogPostListSerializer
        return BlogPostSerializer

    def get_queryset(self):
        queryset = BlogPost.objects.prefetch_related("translations").all()

        # Non-authenticated users only see published posts
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status="published")
        else:
            status_filter = self.request.query_params.get("status")
            if status_filter:
                queryset = queryset.filter(status=status_filter)

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        tag = self.request.query_params.get("tag")
        if tag:
            queryset = queryset.filter(tags__contains=[tag])

        featured = self.request.query_params.get("featured")
        if featured is not None:
            queryset = queryset.filter(featured=featured.lower() == "true")

        return queryset


class BlogPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a blog post by slug."""

    serializer_class = BlogPostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        qs = BlogPost.objects.prefetch_related("translations").all()
        if not self.request.user.is_authenticated:
            qs = qs.filter(status="published")
        return qs


class BlogPostTranslationView(generics.GenericAPIView):
    """List or upsert translations for a blog post."""

    serializer_class = BlogPostTranslationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_post(self):
        return BlogPost.objects.get(slug=self.kwargs["slug"])

    def get(self, request, slug):
        post = self.get_post()
        serializer = self.get_serializer(post.translations.all(), many=True)
        return Response(serializer.data)

    def post(self, request, slug):
        post = self.get_post()
        language = request.data.get("language")
        if not language:
            return Response(
                {"language": "This field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        translation, created = BlogPostTranslation.objects.update_or_create(
            post=post,
            language=language,
            defaults={
                "title": request.data.get("title", ""),
                "slug": request.data.get("slug", ""),
                "excerpt": request.data.get("excerpt", ""),
                "content": request.data.get("content", ""),
            },
        )

        serializer = self.get_serializer(translation)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
