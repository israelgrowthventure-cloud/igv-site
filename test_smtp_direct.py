#!/usr/bin/env python3
"""Test direct de la connexion SMTP OVH"""
import asyncio
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = "mail.israelgrowthventure.com"
SMTP_PORT = 587
SMTP_USER = "contact@israelgrowthventure.com"
SMTP_PASSWORD = "Mikeargela2025#"

async def test_smtp():
    print(f"🧪 Test connexion SMTP OVH...")
    print(f"   Host: {SMTP_HOST}")
    print(f"   Port: {SMTP_PORT}")
    print(f"   User: {SMTP_USER}")
    
    try:
        print("\n1️⃣ Connexion au serveur SMTP...")
        async with aiosmtplib.SMTP(hostname=SMTP_HOST, port=SMTP_PORT) as smtp:
            print("✅ Connexion établie")
            
            print("\n2️⃣ STARTTLS...")
            await smtp.starttls()
            print("✅ STARTTLS OK")
            
            print("\n3️⃣ Authentification...")
            await smtp.login(SMTP_USER, SMTP_PASSWORD)
            print("✅ Authentification réussie")
            
            print("\n4️⃣ Envoi email de test...")
            message = MIMEMultipart()
            message['From'] = SMTP_USER
            message['To'] = "israel.growth.venture@gmail.com"
            message['Subject'] = "Test SMTP OVH - IGV Backend"
            message.attach(MIMEText("Ceci est un test d'envoi depuis le serveur SMTP OVH.", 'plain'))
            
            await smtp.send_message(message)
            print("✅ Email envoyé avec succès!")
            
        print("\n✅ TOUS LES TESTS SMTP PASSÉS")
        return True
        
    except Exception as e:
        print(f"\n❌ ERREUR SMTP: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(test_smtp())
    exit(0 if result else 1)
