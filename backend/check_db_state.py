#!/usr/bin/env python3
"""Vérification rapide de l'état de la DB en production"""
import os
from pymongo import MongoClient

MONGO_URL = "mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/IGV-Cluster"
DB_NAME = "IGV-Cluster"

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

print("=== USERS ===")
users = list(db.users.find())
print(f"Total: {len(users)}")
for u in users:
    print(f"  - {u['email']} (password hash: {u.get('hashed_password', 'N/A')[:20]}...)")

print("\n=== PAGES ===")
pages = list(db.pages.find())
print(f"Total: {len(pages)}")
for p in pages:
    print(f"  - {p['slug']} (lang: {p.get('lang', 'N/A')})")

client.close()
