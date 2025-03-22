import json
from django.http import JsonResponse
from django.views import View
from django.shortcuts import get_object_or_404, render, redirect
from .models import CustomUser
from main.models import Student
from django.contrib.auth import authenticate, login
from .forms import CustomAuthenticationForm
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator
from django.contrib.auth.forms import AuthenticationForm


class CustomLoginView(View):
    template_name = 'accounts/login.html'

    def get(self, request, *args, **kwargs):
        form = AuthenticationForm(request)
        return render(request, self.template_name, {'form': form})

    def post(self, request, *args, **kwargs):
        form = AuthenticationForm(request, data=request.POST)

        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return redirect('main:profile')
            else:
                form.add_error(None, "ユーザーネームまたはパスワードが間違っています。")
                return render(request, self.template_name, {'form': form})

        return render(request, self.template_name, {'form': form})







class StudentUpdateView(View):
    def post(self, request, *args, **kwargs):
        user_id = self.kwargs.get('user_id')
        user = get_object_or_404(CustomUser, pk=user_id)
        student = get_object_or_404(Student, user=user)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)

        username = data.get('username')
        password = data.get('password')
        student_number = data.get('student_number')

        if username:
            user.username = username
        if password:
            user.set_password(password)
        if student_number:
            student.student_number = student_number

        if CustomUser.objects.filter(username=username).exists():
            return JsonResponse({'error': 'このユーザネームはすでに使われている'}, status=400)

        if len(username) > 10:
            return JsonResponse({'error': 'ユーザーネームは最大１０文字'}, status=400)

        user.save()
        student.save()

        return JsonResponse({
            'message': 'Student info updated successfully',
            'username': user.username,
        })