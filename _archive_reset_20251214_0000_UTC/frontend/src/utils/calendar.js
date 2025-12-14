// Google Calendar configuration
// Modifiable dans le .env

const CALENDAR_EMAIL = process.env.REACT_APP_CALENDAR_EMAIL || 'israel.growth.venture@gmail.com';

// Génère un lien Google Calendar pré-rempli
export const generateGoogleCalendarLink = (language = 'fr') => {
  const titles = {
    fr: 'Entretien IGV – Expansion en Israël',
    en: 'IGV Meeting – Expansion in Israel',
    he: 'פגישת IGV – התרחבות בישראל'
  };

  const descriptions = {
    fr: 'Merci de choisir un créneau pour parler de votre projet.\n\nNotre objectif : comprendre votre concept, valider son potentiel en Israël et définir la meilleure stratégie (succursale, franchise ou master-franchise).',
    en: 'Thank you for choosing a time slot to discuss your project.\n\nOur goal: understand your concept, validate its potential in Israel and define the best strategy (branch, franchise or master-franchise).',
    he: 'תודה שבחרת משבצת זמן לדון בפרויקט שלך.\n\nהמטרה שלנו: להבין את הקונספט שלך, לאמת את הפוטנציאל שלו בישראל ולהגדיר את האסטרטגיה הטובה ביותר (סניף, זכיינות או מאסטר פרנצ׳יזה).'
  };

  const title = encodeURIComponent(titles[language] || titles.fr);
  const description = encodeURIComponent(descriptions[language] || descriptions.fr);
  
  // Durée de 30 minutes
  const dates = '';
  
  // URL Google Calendar
  return `https://calendar.google.com/calendar/u/0/r/eventedit?text=${title}&details=${description}&add=${CALENDAR_EMAIL}`;
};
