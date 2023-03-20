"""TheySell URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('loginpage/', views.login_page, name='login_page'),
    path('login/', views.handleLogin, name='login'),
    path('signupuser/', views.handleSignUpUser, name='signupuser'),
    path('signupseller/', views.handleSignUpSeller, name='signupseller'),
    path('logout/', views.handleLogout, name='logout'),
    path('shop/', views.shop, name='shop'),
    path('cart/', views.display_cart, name='displaycart'),
    path('ajax/cartUpdate/', views.update_cart, name='updatecart'),
    path('userprofile/', views.user_profile, name='userprofile'),
    path('allorders/', views.all_orders, name='allorders'),
    path('ordersummary/<str:order_id>', views.order_summary, name='ordersummary'),
    path('orderdelivered/<str:order_id>', views.order_delivered, name='orderdelivered'),
    path('seller/addgood', views.add_good, name='addgood'),
    path('seller/saveGood', views.save_good, name='savegood'),
    path('seller/home', views.seller_home, name='sellerhome'),
    path('seller/withdraw/<str:acc_address>', views.seller_withdraw, name='sellerhome'),
    path('checkout/', views.checkout, name='checkout'),
]+static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
