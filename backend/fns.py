from django.core.mail import send_mail
from django.conf import settings
import secrets
import string
import hashlib

def hash_code(code):
    return hashlib.sha256(code.encode()).hexdigest()

def verify_code(input_code, hashed_code):
    return hash_code(input_code) == hashed_code

def generate_auth_code(length=6):
    characters = string.ascii_uppercase + string.digits
    auth_code=''.join(secrets.choice(characters) for _ in range(length))  # A-Z and 0-9
    hashed_code = hash_code(auth_code)

    return auth_code, hashed_code
    

def send_email(subject, message, recipient_list):
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        recipient_list,
        # fail_silently=False,
    )