# Instructions pour le logo

## ⚠️ ACTION MANUELLE REQUISE

Le nouveau logo doit être copié manuellement car il se trouve en dehors du workspace.

### Étapes à suivre:

1. **Copiez le fichier logo:**
   - Source: `C:\Users\PC\Desktop\IGV\banque image\LOGO\h-large-fond-blanc` (PNG ou JPG)
   - Destination: `c:\Users\PC\Desktop\IGV\igv site\igv-website-complete\frontend\src\assets\h-large-fond-blanc.png`

2. **Vérifiez le format:**
   - Le fichier doit être au format PNG pour la transparence
   - Si c'est un JPG, renommez-le en `.png` ou ajustez l'import dans Header.js

3. **Le code est déjà mis à jour:**
   - `frontend/src/components/Header.js` importe maintenant: `import igvLogo from "../assets/h-large-fond-blanc.png";`
   - Le logo a un espacement ajouté avec la classe `mx-1`

### Commande pour copier (PowerShell):

```powershell
Copy-Item "C:\Users\PC\Desktop\IGV\banque image\LOGO\h-large-fond-blanc.*" -Destination "c:\Users\PC\Desktop\IGV\igv site\igv-website-complete\frontend\src\assets\h-large-fond-blanc.png"
```

### Après avoir copié le logo:

Supprimez ce fichier `LOGO_INSTRUCTIONS.md` et lancez:
```bash
cd frontend
npm run build
```
