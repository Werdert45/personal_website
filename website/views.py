from django.shortcuts import render
from django.http import *
from django.template import loader
import datetime


# Create your views here.

def index(request):
    return render(request, 'website/home.html')


def portfolio(request):
    return render(request, 'website/portfolio.html')


def resume(request):
    return render(request, 'website/resume.html')


def contact(request):
    return render(request, 'website/contact.html')
