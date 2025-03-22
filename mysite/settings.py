"""
Django settings for mysite project.

Generated by 'django-admin startproject' using Django 4.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.0/ref/settings/
"""

from pathlib import Path
import os

from django.http import HttpResponsePermanentRedirect
from django.conf import settings


class SSLRedirectMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not settings.DEBUG and not request.is_secure():
            secure_url = request.build_absolute_uri(request.get_full_path()).replace('http://', 'https://')
            return HttpResponsePermanentRedirect(secure_url)
        return self.get_response(request)


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'goijgorijvdoinoirghjoetirpkopkfpo45$%#"nfjkonjgooppkpgokpf,ls;lrpp@'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# settings.py

MEDIA_URL = '/media/'
MEDIA_ROOT = '/home/amaterasu1337/django_projects/mysite/mysite/media/'


ALLOWED_HOSTS = [ '*' ]

AUTH_PASSWORD_VALIDATORS = []
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',

    'django_extensions',
    'multiselectfield',
    'crispy_forms',
    'rest_framework',
    'social_django',
    'taggit',
    'accounts.apps.AccountsConfig',
    'main.apps.MainConfig',
    'crispy_bootstrap5',
    'django_redis',
    'channels',
]

CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"

MIDDLEWARE = [
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'mysite.settings.SSLRedirectMiddleware',
    'accounts.middleware.RedirectAuthenticatedUserMiddleware',
]

ROOT_URLCONF = 'mysite.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'main.context_processors.settings',      # Add
                'social_django.context_processors.backends',  # Add
                'social_django.context_processors.login_redirect', # Add
            ],
        },
    },
]

WSGI_APPLICATION = 'mysite.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'dbeibaru',
        'USER': 'eibaru',
        'PASSWORD': '*****',
        'HOST': 'ls-2e19b2dae7ca9c7101c5c1a11b376cbe2d76e307.cxo6qo6s0o1y.ap-northeast-1.rds.amazonaws.com',
        'PORT': '3306',
        'OPTIONS': {  # OPTIONS should be inside the 'default' dictionary
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.0/ref/settings/#auth-password-validators

AUTH_USER_MODEL = 'accounts.CustomUser'



# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/




LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Tokyo'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.0/howto/static-files/

STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Define the directory where your collected static files will be stored
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://:ogijrogirjocjkpeokrgpoijoijoicer546jovgjroi6jy5@172.26.5.146:6379/1',  
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SOCKET_CONNECT_TIMEOUT': 5, 
            'SOCKET_TIMEOUT': 5,         
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 100, 
            },
        }
    }
}

# Optional: This is to ensure Django sessions are stored in Redis
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
# Security settings
SESSION_COOKIE_AGE = 120960000
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_TYPE_NOSNIFF = True

SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
