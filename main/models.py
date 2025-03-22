from django.db import models
from accounts.models import CustomUser
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password


class Teacher(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username


class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    student_number = models.CharField(max_length=20, null=True)

    def __str__(self):
        return self.user.username

class Classroom(models.Model):
    teacher = models.ManyToManyField(Teacher, blank=True, related_name='classrooms')
    students = models.ManyToManyField(Student, blank=True, related_name='classrooms')
    character_voice = models.BooleanField(default=False)
    name = models.CharField(max_length=200, unique=True)

    def set_password(self, raw_password):
        self.hashed_password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.hashed_password)

    def __str__(self):
        return self.name

class ClassroomRequest(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, null=True, )
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, related_name='requests')
    is_accepted = models.BooleanField(default=False)
    unchangeable = models.BooleanField(default=False)


class Test(models.Model):
    CATEGORY_CHOICES = [
        ('japanese', 'Japanese'),
        ('english_5', 'English 5'),
        ('english_6', 'English 6'),
        ('phonics', 'Phonics'),
        ('numbers', 'Numbers'),
        ('eiken', 'Eiken'),
    ]
    name = models.CharField(max_length=200)
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, default=12)
    picture_url = models.URLField(max_length=500, null=True, blank=True)
    sound_url = models.URLField(max_length=500, null=True, blank=True)
    total_questions = models.PositiveIntegerField(default=0)
    score_multiplier = models.PositiveIntegerField(default=1)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='phonics')
    lesson_number = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    number_of_questions = models.PositiveIntegerField(default=10)
    total_score = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.total_score = self.number_of_questions * self.score_multiplier
        super().save(*args, **kwargs)


class MaxScore(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    score = models.FloatField(default=0)
    total_questions = models.FloatField(default=0)


class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=500)
    description = models.BooleanField(default=False)
    question_list = models.JSONField(blank=True, default=dict)
    write_answer = models.BooleanField(default=False)
    first_letter = models.BooleanField(default=False)
    second_letter = models.BooleanField(default=False)
    third_letter = models.BooleanField(default=False)
    last_letter = models.BooleanField(default=False)
    double_object = models.BooleanField(default=False)
    no_sound = models.BooleanField(default=False)
    sound2 = models.BooleanField(default=False)
    sound3 = models.BooleanField(default=False)
    sound4 = models.BooleanField(default=False)
    picture2 = models.BooleanField(default=False)
    word2 = models.BooleanField(default=False)
    label = models.BooleanField(default=False)
    japanese_option = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)
    option_list = models.JSONField(blank=True, default=dict)

    def __str__(self):
        return self.name
