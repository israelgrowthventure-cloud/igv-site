import requests
r = requests.post('https://igv-cms-backend.onrender.com/api/auth/login', 
                  json={'email':'postmaster@israelgrowthventure.com','password':'Admin@igv2025#'}, 
                  timeout=30)
print(f'Auth: {r.status_code}')
token = r.json()['access_token']
pages = requests.get('https://igv-cms-backend.onrender.com/api/pages', 
                     headers={'Authorization':f'Bearer {token}'}, 
                     timeout=30).json()
print(f'Pages CMS existantes: {len(pages)}')
for p in pages:
    published = "✅" if p.get('published') else "❌"
    print(f"  {published} {p['slug']} ({p.get('path', 'N/A')})")
