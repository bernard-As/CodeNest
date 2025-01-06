from django.contrib import admin
from django.apps import apps

# Register your models here.
models = apps.get_models()  

# Register only the models that are not already registered
for model in models:
    if not admin.site.is_registered(model):
        admin.site.register(model)
