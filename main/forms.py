from django import forms
from main.models import Classroom, Test, Question, Option
from django.core.files.uploadedfile import InMemoryUploadedFile
from accounts.models import CustomUser
from main.humanize import naturalsize
from django.forms import DateInput
from django.core.exceptions import ValidationError
from django.forms import CharField
from .lists_eiken import eiken5_vocab1, eiken5_vocab2, eiken5_vocab3, eiken5_vocab4, eiken5_vocab5, eiken5_vocab6, eiken5_vocab7, eiken5_vocab8, eiken5_vocab9, eiken5_vocab10, eiken5_vocab11, eiken5_vocab12, eiken5_vocab13, eiken5_vocab14, eiken5_vocab15, eiken5_vocab16, eiken5_grammar_conversation, eiken5_vocab, eiken5_vocab_practice, eiken5_grammar_practice, eiken5_conversation_vocab_practice
from .lists import alphabet_sounds3, grade5_lesson8, grade5_lesson7, grade5_lesson1_names, grade5_lesson1_words, grade5_lesson1_sentence, grade5_lesson2, grade5_lesson3, dates, months, days, grade6_lesson1, grade6_lesson2, grade6_lesson3, grade_6_lesson_8, grade_6_lesson_7, phonics3, alphabet_sounds2, japanese_numbers, grade_6_lesson_6, alphabet_sounds, one_twenty, one_hundred, eleven_ninety, one_thousand, one_quadrillion, thousand_quadrillion, grade_6_lesson_5, grade_5_lesson_5, grade_5_lesson_6, small_alphabet_sounds, alphabet_phonics, jlpt_n5_vocabulary, phonics1, phonics_2, lesson4_list, lesson4_grade6_dict

class ClassroomJoinForm(forms.Form):
    classroom_name = forms.CharField(
        label="教室名",
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'}),
    )

class ConnectTestForm(forms.Form):
    classroom_name = forms.CharField(
        label="教室名",
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control'}),
    )
    classroom_password = forms.CharField(
        label="教室のパスワード",
        required=True,
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
    )


class SingleCheckboxSelect(forms.CheckboxSelectMultiple):
    def value_from_datadict(self, data, files, name):
        value = super().value_from_datadict(data, files, name)
        if isinstance(value, list):
            return value[0] if value else None
        return value








class ClassroomCreateForm(forms.ModelForm):


    class Meta:
        model = Classroom
        fields = ['name']

        labels = {
            'name': '教室名',
        }

        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
        }





class TestCreateForm(forms.ModelForm):

    class Meta:
        model = Test
        fields = ['name', 'description', 'category', 'picture_url', 'sound_url', 'lesson_number', 'score_multiplier', 'number_of_questions']

    widgets = {
        'name': forms.TextInput(attrs={'class': 'form-control'}),
    }


class QuestionCreateForm(forms.ModelForm):

    list_choices = [
        ('alphabet_sounds', 'Alphabet Sounds'),
        ('small_alphabet_sounds', 'Small Alphabet Sounds'),
        ('jlpt_n5_vocabulary', 'Jlpt_n5_vocabulary'),
        ('phonics1', 'Phonics1'),
        ('phonics3', 'Phonics3'),
        ('lesson4_list', 'Lesson4_list'),
        ('lesson4_grade6_dict', 'Lesson4_grade6_dict'),
        ('alphabet_phonics', 'Alphabet_phonics'),
        ('phonics_2', 'Phonics_2'),
        ('grade_6_lesson_5', 'grade_6_lesson_5'),
        ('grade5_lesson1_names', 'grade5_lesson1_names'),
        ('grade5_lesson1_words', 'grade5_lesson1_words'),
        ('grade5_lesson1_sentence', 'grade5_lesson1_sentence'),
        ('grade5_lesson2', 'grade5_lesson2'),
        ('grade5_lesson3', 'grade5_lesson3'),
        ('grade5_lesson7', 'grade5_lesson7'),
        ('grade5_lesson8', 'grade5_lesson8'),
        ('grade_5_lesson_5', 'grade_5_lesson_5'),
        ('grade_5_lesson_6', 'grade_5_lesson_6'),
        ('grade_6_lesson_6', 'grade_6_lesson_6'),
        ('grade_6_lesson_7', 'grade_6_lesson_7'),
        ('grade_6_lesson_8', 'grade_6_lesson_8'),
        ('grade6_lesson1', 'grade6_lesson1'),
        ('grade6_lesson2', 'grade6_lesson2'),
        ('grade6_lesson3', 'grade6_lesson3'),
        ('months', 'Months'),
        ('dates', 'Dates'),
        ('days', 'Days'),
        ('one_twenty', 'One Twenty'),
        ('one_hundred', 'One Hundred'),
        ('eleven_ninety', 'Eleven Ninety'),
        ('one_thousand', 'One Thousand'),
        ('one_quadrillion', 'One Quadrillion'),
        ('thousand_quadrillion', 'Thousand Quadrillion'),
        ('japanese_numbers', 'Japanese_Numbers'),
        ('alphabet_sounds2', 'Alphabet Sounds2'),
        ('alphabet_sounds3', 'Alphabet Sounds3'),
        ('eiken5_vocab1', 'Eiken5_vocab1'),
        ('eiken5_vocab2', 'Eiken5_vocab2'),
        ('eiken5_vocab3', 'Eiken5_vocab3'),
        ('eiken5_vocab4', 'Eiken5_vocab4'),
        ('eiken5_vocab5', 'Eiken5_vocab5'),
        ('eiken5_vocab6', 'Eiken5_vocab6'),
        ('eiken5_vocab7', 'Eiken5_vocab7'),
        ('eiken5_vocab8', 'Eiken5_vocab8'),
        ('eiken5_vocab9', 'Eiken5_vocab9'),
        ('eiken5_vocab10', 'Eiken5_vocab10'),
        ('eiken5_vocab11', 'Eiken5_vocab11'),
        ('eiken5_vocab12', 'Eiken5_vocab12'),
        ('eiken5_vocab13', 'Eiken5_vocab13'),
        ('eiken5_vocab14', 'Eiken5_vocab14'),
        ('eiken5_vocab15', 'Eiken5_vocab15'),
        ('eiken5_vocab16', 'Eiken5_vocab16'),
        ('eiken5_vocab', 'Eiken5_vocab'),
        ('eiken5_vocab_practice', 'eiken5_vocab_practice'),
        ('eiken5_grammar_practice', 'eiken5_grammar_practice'),
        ('eiken5_grammar_conversation', 'eiken5_grammar_conversation'),
        ('eiken5_conversation_vocab_practice', 'eiken5_conversation_vocab_practice'),
    ]
    list_selection = forms.ChoiceField(choices=list_choices, required=False, label='Select List')



    class Meta:
        model = Question
        fields = ['name', 'description', 'double_object', 'write_answer', 'japanese_option', 'question_list', 'list_selection', 'first_letter', 'second_letter', 'third_letter', 'last_letter', 'no_sound', 'sound2', 'sound3', 'sound4', 'picture2', 'word2', 'label']

    widgets = {
        'name': forms.TextInput(attrs={'class': 'form-control'}),
    }


    def save(self, commit=True):
        instance = super(QuestionCreateForm, self).save(commit=False)

        selected_list = self.cleaned_data.get('list_selection')
        if selected_list:
            if selected_list == 'alphabet_sounds':
                instance.question_list = alphabet_sounds
            elif selected_list == 'small_alphabet_sounds':
                instance.question_list = small_alphabet_sounds
            elif selected_list == 'jlpt_n5_vocabulary':
                instance.question_list = jlpt_n5_vocabulary
            elif selected_list == 'phonics1':
                instance.question_list = phonics1
            elif selected_list == 'phonics3':
                instance.question_list = phonics3
            elif selected_list == 'lesson4_list':
                instance.question_list = lesson4_list
            elif selected_list == 'lesson4_grade6_dict':
                instance.question_list = lesson4_grade6_dict
            elif selected_list == 'alphabet_phonics':
                instance.question_list = alphabet_phonics
            elif selected_list == 'phonics_2':
                instance.question_list = phonics_2
            elif selected_list == 'grade_6_lesson_5':
                instance.question_list = grade_6_lesson_5
            elif selected_list == 'grade_6_lesson_6':
                instance.question_list = grade_6_lesson_6
            elif selected_list == 'grade_6_lesson_7':
                instance.question_list = grade_6_lesson_7
            elif selected_list == 'grade5_lesson1_names':
                instance.question_list = grade5_lesson1_names
            elif selected_list == 'grade5_lesson1_words':
                instance.question_list = grade5_lesson1_words
            elif selected_list == 'grade5_lesson1_sentence':
                instance.question_list = grade5_lesson1_sentence
            elif selected_list == 'grade5_lesson2':
                instance.question_list = grade5_lesson2
            elif selected_list == 'grade5_lesson3':
                instance.question_list = grade5_lesson3
            elif selected_list == 'grade5_lesson7':
                instance.question_list = grade5_lesson7
            elif selected_list == 'grade5_lesson8':
                instance.question_list = grade5_lesson8
            elif selected_list == 'grade_5_lesson_5':
                instance.question_list = grade_5_lesson_5
            elif selected_list == 'grade_5_lesson_6':
                instance.question_list = grade_5_lesson_6
            elif selected_list == 'grade_6_lesson_8':
                instance.question_list = grade_6_lesson_8
            elif selected_list == 'grade6_lesson1':
                instance.question_list = grade6_lesson1
            elif selected_list == 'grade6_lesson2':
                instance.question_list = grade6_lesson2
            elif selected_list == 'grade6_lesson3':
                instance.question_list = grade6_lesson3
            elif selected_list == 'one_twenty':
                instance.question_list = one_twenty
            elif selected_list == 'months':
                instance.question_list = months
            elif selected_list == 'dates':
                instance.question_list = dates
            elif selected_list == 'days':
                instance.question_list = days
            elif selected_list == 'one_hundred':
                instance.question_list = one_hundred
            elif selected_list == 'eleven_ninety':
                instance.question_list = eleven_ninety
            elif selected_list == 'one_thousand':
                instance.question_list = one_thousand
            elif selected_list == 'one_quadrillion':
                instance.question_list = one_quadrillion
            elif selected_list == 'thousand_quadrillion':
                instance.question_list = thousand_quadrillion
            elif selected_list == 'japanese_numbers':
                instance.question_list = japanese_numbers
            elif selected_list == 'alphabet_sounds2':
                instance.question_list = alphabet_sounds2
            elif selected_list == 'alphabet_sounds3':
                instance.question_list = alphabet_sounds3
            elif selected_list == 'eiken5_vocab1':
                instance.question_list = eiken5_vocab1
            elif selected_list == 'eiken5_vocab2':
                instance.question_list = eiken5_vocab2
            elif selected_list == 'eiken5_vocab3':
                instance.question_list = eiken5_vocab3
            elif selected_list == 'eiken5_vocab4':
                instance.question_list = eiken5_vocab4
            elif selected_list == 'eiken5_vocab5':
                instance.question_list = eiken5_vocab5
            elif selected_list == 'eiken5_vocab6':
                instance.question_list = eiken5_vocab6
            elif selected_list == 'eiken5_vocab7':
                instance.question_list = eiken5_vocab7
            elif selected_list == 'eiken5_vocab8':
                instance.question_list = eiken5_vocab8
            elif selected_list == 'eiken5_vocab9':
                instance.question_list = eiken5_vocab9
            elif selected_list == 'eiken5_vocab10':
                instance.question_list = eiken5_vocab10
            elif selected_list == 'eiken5_vocab11':
                instance.question_list = eiken5_vocab11
            elif selected_list == 'eiken5_vocab12':
                instance.question_list = eiken5_vocab12
            elif selected_list == 'eiken5_vocab13':
                instance.question_list = eiken5_vocab13
            elif selected_list == 'eiken5_vocab14':
                instance.question_list = eiken5_vocab14
            elif selected_list == 'eiken5_vocab15':
                instance.question_list = eiken5_vocab15
            elif selected_list == 'eiken5_vocab16':
                instance.question_list = eiken5_vocab16
            elif selected_list == 'eiken5_vocab':
                instance.question_list = eiken5_vocab
            elif selected_list == 'eiken5_vocab_practice':
                instance.question_list = eiken5_vocab_practice
            elif selected_list == 'eiken5_grammar_practice':
                instance.question_list = eiken5_grammar_practice
            elif selected_list == 'eiken5_grammar_conversation':
                instance.question_list = eiken5_grammar_conversation
            elif selected_list == 'eiken5_conversation_vocab_practice':
                instance.question_list = eiken5_conversation_vocab_practice

        if commit:
            instance.save()

        return instance


class OptionCreateForm(forms.ModelForm):



    class Meta:
        model = Option
        fields = ['name', 'is_correct']

    widgets = {
        'name': forms.TextInput(attrs={'class': 'form-control'}),
    }