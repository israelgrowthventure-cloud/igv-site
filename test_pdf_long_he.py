"""
Test génération PDF avec une VRAIE analyse longue en hébreu
Pour voir si le PDF contient tout le contenu
"""
import requests
import base64

BACKEND_URL = "https://igv-cms-backend.onrender.com"

# Analyse LONGUE en hébreu (simulant une vraie analyse Gemini)
analysis_text_he_long = """
ניתוח שוק ישראלי מקיף למותג TestBrand

1. סקירת שוק
השוק הישראלי מציע הזדמנויות ייחודיות לחברות בתחום הטכנולוגיה. עם אוכלוסייה של כ-9 מיליון תושבים, ישראל נחשבת ל"אומת הסטארט-אפ" עם אקוסיסטם חדשנות מתקדם.

הסקטור הטכנולוגי בישראל מתאפיין ב:
- השקעות גבוהות בחדשנות ומחקר ופיתוח
- מערכת חינוכית איכותית המייצרת כישרונות טכנולוגיים
- תרבות יזמית חזקה
- קשרים הדוקים עם המרכזים הטכנולוגיים הגלובליים

2. הזדמנויות עיקריות

א. צמיחה בסקטור הטכנולוגיה
השוק הישראלי צומח בקצב של 5-7% בשנה, עם התמקדות במגזרי ההייטק, הסייבר והבינה המלאכותית.

ב. גישה לטאלנטים איכותיים
ישראל מייצרת מהנדסי תוכנה ואנשי מחקר ברמה גבוהה, הודות למערכת ההשכלה הגבוהה ולשירות הצבאי הטכנולוגי.

ג. מיקום אסטרטגי
מיקומה של ישראל מאפשר גישה לשווקים באירופה, אסיה והמזרח התיכון.

ד. תמיכה ממשלתית
הממשלה הישראלית מציעה תמריצים רבים לחברות זרות, כולל הטבות מס וסיוע בהקמה.

3. אתגרים עיקריים

א. תחרות גבוהה
השוק הישראלי רווי בחברות טכנולוגיה, מה שמייצר תחרות עזה על לקוחות וכישרונות.

ב. רגולציה מורכבת
מערכת הרגולציה הישראלית יכולה להיות מסובכת לחברות זרות, במיוחד בתחומים כמו נתונים אישיים ואבטחת מידע.

ג. עלויות גבוהות
עלות המחיה והשכר בישראל גבוהות יחסית, במיוחד במרכזים הטכנולוגיים כמו תל אביב.

ד. אי-ודאות גיאופוליטית
המצב הביטחוני והגיאופוליטי יכול להשפיע על החלטות עסקיות ארוכות טווח.

4. אסטרטגיית כניסה מומלצת

לאור הניתוח, מומלץ לשקול את הגישות הבאות:

א. שותפויות אסטרטגיות
חיפוש שותפים מקומיים שיכולים לספק ידע שוק ומערכת קשרים.

ב. התחלה קטנה
פתיחה במשרד קטן או מרכז פיתוח לפני השקעה מסיבית.

ג. התמקדות בנישות
במקום להתחרות בשוק הכללי, התמקדות בסגמנטים ספציפיים בהם לחברה יתרון תחרותי.

ד. ניצול התמריצים הממשלתיים
קבלת ייעוץ מקצועי לגבי התמריצים והטבות המס הזמינים.

5. המלצות סופיות

TestBrand יכול להצליח בשוק הישראלי בתנאי ש:
- יושקע בהבנת התרבות העסקית המקומית
- תיבנה מערכת קשרים חזקה
- תותאם האסטרטגיה לצרכים הייחודיים של השוק
- יוקצו משאבים מספיקים לפעילות ארוכת טווח

ההזדמנויות בשוק הישראלי משמעותיות, אך הצלחה דורשת תכנון קפדני והבנה עמוקה של הדינמיקה המקומית.

לליווי מקצועי בתהליך הכניסה לשוק הישראלי, אנו ממליצים ליצור קשר עם Israel Growth Venture.
"""

print("=" * 80)
print("TEST PDF GENERATION AVEC ANALYSE LONGUE HE")
print(f"Longueur analyse: {len(analysis_text_he_long)} caractères")
print("=" * 80)

payload = {
    "email": "test@example.com",
    "brandName": "TestBrand",
    "sector": "Tech",
    "origin": "France",
    "analysis": analysis_text_he_long,
    "language": "he"
}

print("\n[1] Génération PDF...")
response = requests.post(
    f"{BACKEND_URL}/api/pdf/generate",
    json=payload,
    timeout=30
)

print(f"Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    pdf_b64 = data.get("pdfBase64")
    
    if pdf_b64:
        # Sauvegarder le PDF
        pdf_bytes = base64.b64decode(pdf_b64)
        output_path = "test_pdf_long_he.pdf"
        
        with open(output_path, "wb") as f:
            f.write(pdf_bytes)
        
        print(f"✅ PDF généré: {len(pdf_bytes)} bytes")
        print(f"✅ Sauvegardé: {output_path}")
        
        # Vérifier le contenu avec PyPDF2
        import PyPDF2
        with open(output_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            total_text = ""
            for page in pdf_reader.pages:
                total_text += page.extract_text()
            
            print(f"\n📄 Texte extrait du PDF: {len(total_text)} caractères")
            print(f"   Ratio: {len(total_text)}/{len(analysis_text_he_long)} = {len(total_text)/len(analysis_text_he_long)*100:.1f}%")
            
            if len(total_text) < len(analysis_text_he_long) * 0.8:
                print(f"   ⚠️ PERTE DE CONTENU! Seulement {len(total_text)/len(analysis_text_he_long)*100:.1f}% du texte présent")
            else:
                print(f"   ✅ Contenu complet présent")
    else:
        print(f"❌ Pas de pdfBase64 dans la réponse")
else:
    print(f"❌ Erreur: {response.text}")

print("\n" + "=" * 80)
