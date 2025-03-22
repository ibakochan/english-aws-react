from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from django.urls import reverse_lazy


app_name='accounts'
urlpatterns = [
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('login/', views.CustomLoginView.as_view(template_name='accounts/login.html'), name='login'),
    path('update-student/<int:user_id>/', views.StudentUpdateView.as_view(), name='update_student'),
]