"""Test direct SMTP pour identifier le problème email"""
import asyncio
import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os

# Configuration SMTP (doit être dans .env backend)
SMTP_SERVER = "ssl0.ovh.net"
SMTP_PORT = 465
SMTP_USERNAME = "contact@israelgrowthventure.com"
# Le mot de passe doit être dans les variables d'environnement Render

print("=" * 80)
print("TEST SMTP DIRECT")
print("=" * 80)

print(f"\nConfiguration:")
print(f"  Server: {SMTP_SERVER}:{SMTP_PORT}")
print(f"  From: {SMTP_USERNAME}")
print(f"  Method: SSL direct (port 465)")

# Note : Ce test ne fonctionnera pas localement sans le mot de passe
# Il sert à diagnostiquer la configuration

print(f"\n⚠️ Ce test nécessite SMTP_PASSWORD dans les variables d'environnement")
print(f"Sur Render, vérifier que SMTP_PASSWORD est configuré correctement")

print("\n" + "=" * 80)
print("DIAGNOSTIC:")
print("=" * 80)
print("Si erreur 502 sur /api/email/send-pdf:")
print("  1. Vérifier SMTP_PASSWORD dans Render environment variables")
print("  2. Vérifier que le mot de passe OVH est correct")
print("  3. Vérifier que contact@israelgrowthventure.com peut envoyer")
print("  4. Vérifier logs Render backend pour l'erreur exacte SMTP")
print("=" * 80)
