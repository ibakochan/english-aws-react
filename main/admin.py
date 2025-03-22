from django.contrib import admin
from accounts.models import CustomUser

from main.models import Classroom, Test, Question, Option, Teacher, Student, MaxScore, ClassroomRequest
admin.site.register([Classroom, Test, Question, Option, CustomUser, Teacher, Student, MaxScore, ClassroomRequest])