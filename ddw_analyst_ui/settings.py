"""
Django settings for ddw_analyst_ui project.

Generated by 'django-admin startproject' using Django 2.1.7.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Admin emails
ADMINS = [
    ('Edwin', 'edwin.magezi@devinit.org'),
    ('Alex', 'alex.miller@devinit.org'),
    ('David', 'david.ebukali@devinit.org'),
    ('Chris', 'chrisw@devinit.org')
]

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY',
                       '!brp5jw6nf-2f*=6=s$$@2he&!y+x*2gkhb6ate$ne-kt7c#h4')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEV', 'False') == 'True'

ALLOWED_HOSTS = ['.devinit.org', 'localhost', '127.0.0.1', '167.99.86.10']

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

SECURE_SSL_REDIRECT = not DEBUG


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'frontend',
    'core',
    'data',
    'rest_framework',
    'rest_framework.authtoken',
    'social_django',
    'rest_social_auth',
    'knox',
    'ddw_analyst_ui',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('knox.auth.TokenAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated'
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 10
}

REST_KNOX = {
    'USER_SERIALIZER': 'core.serializers.UserSerializer',
}

SOCIAL_AUTH_RAISE_EXCEPTIONS = True
SOCIAL_AUTH_URL_NAMESPACE = 'social'
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = '32052845450-1mv756tj0in5kd44kjhfhc8d8938p620.apps.googleusercontent.com'
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = 'O7EoDtuKmWaratccVUHm_0W4'
# SOCIAL_AUTH_GOOGLE_OAUTH2_FIELDS = ['email', 'username']  # optional

AUTHENTICATION_BACKENDS = (
    # 'social_core.backends.facebook.FacebookOAuth2',
    'social_core.backends.google.GoogleOAuth2',
    # 'rest_framework_social_oauth2.backends.DjangoOAuth2',
    'django.contrib.auth.backends.ModelBackend',)

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ddw_analyst_ui.urls'

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
            ],
        },
    },
]

WSGI_APPLICATION = 'ddw_analyst_ui.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'analyst_ui',
        'USER': 'postgres',
    },
    'datasets': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'options': '-c search_path=repo'  # Add future non-public schemas here
        },
        'NAME': 'analyst_ui',
        'USER': 'postgres',
        'TEST': {
            'MIRROR': 'default'
        }
    }
}

DATABASE_ROUTERS = ['data.db_router.DataRouter', 'core.db_router.CoreRouter']

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Default location for manual CSV import
CSV_FILES_FOLDER = os.path.join(BASE_DIR, 'data_updates', 'manual', 'CSV')

IS_TESTING = False

QUERY_TABLES = [
    'fts_codenames', 'fts_privatemoney', 'fts_dacregion', 'fts_donorscountryid', 'fts_recipientcodename', 'fts_ngotype', 'fts_deliverychannels',
    'fts_recipientcountryid', 'fts_odaeligible', 'fts_destinationcountryid', 'fts_incomegroups', 'fts_deflators', 'fts_isos', 'fts_privatemoney',
    'oecd_crs_aid_type_ref', 'oecd_crs_channel_map', 'oecd_crs_sector_itep_map', 'oecd_crs_donor_type_ref',
    'dac5_current_isos', 'dac2b_current_isos', 'dac2a_current_isos', 'dac1_current_isos', 'crs_current_regisos', 'crs_current_isos',
    'iati_publishers'
]

# Celery
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL')

# Git Token
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = 'devinitautomailer@gmail.com'
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

# Disable allowed host emails to admin
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
            'include_html': True,
        },
        'null': {
            'class': 'logging.NullHandler',
        },
    },
    'loggers': {
        'django.security.DisallowedHost': {
            'handlers': ['null'],
            'propagate': False,
        },
    },
}

try:
    from ddw_analyst_ui.local_settings import DATABASES, SECRET_KEY
except ImportError:
    pass
