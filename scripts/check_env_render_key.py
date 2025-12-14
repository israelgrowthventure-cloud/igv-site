#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vérifie présence RENDER_API_KEY (ou fallback RENDER_API_TOKEN)
Retour: 0 si présent, 1 si absent
N'affiche JAMAIS la valeur, seulement PRESENT/ABSENT + longueur
"""
import os
import sys

# Force UTF-8 Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    api_key = os.getenv('RENDER_API_KEY')
    source = 'RENDER_API_KEY'
    
    if not api_key:
        api_key = os.getenv('RENDER_API_TOKEN')
        source = 'RENDER_API_TOKEN (fallback)'
    
    if api_key:
        print(f"✓ {source}: PRESENT (length: {len(api_key)} chars)")
        return 0
    else:
        print("✗ RENDER_API_KEY: ABSENT (ni RENDER_API_KEY ni RENDER_API_TOKEN)")
        print("Source attendue: Render Environment Variables")
        return 1

if __name__ == '__main__':
    sys.exit(main())
