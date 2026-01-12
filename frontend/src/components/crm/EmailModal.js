import React, { useState } from 'react';
import { X, Send, Loader2, FileText, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

// Predefined email templates
const EMAIL_TEMPLATES = {
  fr: [
    {
      id: 'welcome',
      name: 'Bienvenue',
      subject: 'Bienvenue chez Israel Growth Venture',
      body: `Bonjour {{name}},

Merci de votre intérêt pour Israel Growth Venture !

Nous avons bien reçu votre demande et nous sommes ravis de vous accompagner dans votre projet d'expansion en Israël.

Un de nos experts vous contactera très prochainement pour discuter de vos besoins et vous présenter nos solutions adaptées.

En attendant, n'hésitez pas à consulter notre site pour découvrir nos différents packs d'accompagnement.

Cordialement,
L'équipe Israel Growth Venture`
    },
    {
      id: 'followup',
      name: 'Relance',
      subject: 'Suite à notre échange - IGV',
      body: `Bonjour {{name}},

Je me permets de vous recontacter suite à notre précédent échange concernant votre projet d'expansion en Israël.

Avez-vous eu le temps de réfléchir à notre proposition ? Nous restons à votre disposition pour répondre à toutes vos questions.

N'hésitez pas à me rappeler ou à réserver un créneau pour un nouvel échange.

Cordialement,
L'équipe Israel Growth Venture`
    },
    {
      id: 'meeting',
      name: 'Confirmation RDV',
      subject: 'Confirmation de votre rendez-vous - IGV',
      body: `Bonjour {{name}},

Je vous confirme notre rendez-vous prévu le [DATE] à [HEURE].

Lors de cet échange, nous aborderons :
- Votre projet d'expansion en Israël
- Les opportunités du marché israélien pour votre secteur
- Nos solutions d'accompagnement adaptées

En préparation de ce rendez-vous, je vous invite à réfléchir aux points suivants :
- Vos objectifs à court et moyen terme
- Votre budget approximatif
- Vos questions spécifiques

À très bientôt !

Cordialement,
L'équipe Israel Growth Venture`
    },
    {
      id: 'proposal',
      name: 'Envoi proposition',
      subject: 'Votre proposition personnalisée - IGV',
      body: `Bonjour {{name}},

Suite à notre échange, veuillez trouver ci-joint notre proposition personnalisée pour votre projet d'expansion en Israël.

Cette proposition inclut :
- Une analyse préliminaire du marché pour votre secteur
- Notre recommandation de pack d'accompagnement
- Le détail de nos prestations et tarifs

Nous restons à votre entière disposition pour en discuter et ajuster cette proposition selon vos besoins.

Cordialement,
L'équipe Israel Growth Venture`
    },
    {
      id: 'thank_you',
      name: 'Remerciement',
      subject: 'Merci pour votre confiance - IGV',
      body: `Bonjour {{name}},

Nous tenons à vous remercier pour votre confiance !

Nous sommes ravis de vous accompagner dans votre projet d'expansion en Israël. Notre équipe se tient prête à mettre tout en œuvre pour assurer le succès de votre implantation.

Votre interlocuteur dédié vous contactera sous peu pour lancer les premières étapes de votre projet.

Cordialement,
L'équipe Israel Growth Venture`
    }
  ],
  en: [
    {
      id: 'welcome',
      name: 'Welcome',
      subject: 'Welcome to Israel Growth Venture',
      body: `Hello {{name}},

Thank you for your interest in Israel Growth Venture!

We have received your request and we are delighted to support you in your expansion project in Israel.

One of our experts will contact you very soon to discuss your needs and present our tailored solutions.

In the meantime, feel free to visit our website to discover our various support packages.

Best regards,
Israel Growth Venture Team`
    },
    {
      id: 'followup',
      name: 'Follow-up',
      subject: 'Following up on our conversation - IGV',
      body: `Hello {{name}},

I wanted to follow up on our previous conversation about your expansion project in Israel.

Have you had time to consider our proposal? We remain at your disposal to answer any questions.

Please don't hesitate to call me back or book a slot for another discussion.

Best regards,
Israel Growth Venture Team`
    },
    {
      id: 'meeting',
      name: 'Meeting Confirmation',
      subject: 'Confirmation of your appointment - IGV',
      body: `Hello {{name}},

I confirm our meeting scheduled for [DATE] at [TIME].

During this exchange, we will discuss:
- Your expansion project in Israel
- Market opportunities in Israel for your sector
- Our tailored support solutions

In preparation for this meeting, I invite you to think about:
- Your short and medium term objectives
- Your approximate budget
- Your specific questions

See you soon!

Best regards,
Israel Growth Venture Team`
    },
    {
      id: 'proposal',
      name: 'Proposal',
      subject: 'Your personalized proposal - IGV',
      body: `Hello {{name}},

Following our discussion, please find attached our personalized proposal for your expansion project in Israel.

This proposal includes:
- A preliminary market analysis for your sector
- Our recommended support package
- Details of our services and pricing

We remain at your full disposal to discuss and adjust this proposal according to your needs.

Best regards,
Israel Growth Venture Team`
    },
    {
      id: 'thank_you',
      name: 'Thank You',
      subject: 'Thank you for your trust - IGV',
      body: `Hello {{name}},

We want to thank you for your trust!

We are delighted to support you in your expansion project in Israel. Our team is ready to do everything possible to ensure the success of your establishment.

Your dedicated contact will reach out shortly to initiate the first steps of your project.

Best regards,
Israel Growth Venture Team`
    }
  ],
  he: [
    {
      id: 'welcome',
      name: 'ברוכים הבאים',
      subject: 'ברוכים הבאים ל-Israel Growth Venture',
      body: `שלום {{name}},

תודה על ההתעניינות שלך ב-Israel Growth Venture!

קיבלנו את הפנייה שלך ואנחנו שמחים ללוות אותך בפרויקט ההתרחבות שלך בישראל.

אחד המומחים שלנו יצור איתך קשר בקרוב מאוד כדי לדון בצרכים שלך ולהציג את הפתרונות המותאמים שלנו.

בינתיים, מוזמן לבקר באתר שלנו כדי לגלות את חבילות הליווי השונות.

בברכה,
צוות Israel Growth Venture`
    },
    {
      id: 'followup',
      name: 'מעקב',
      subject: 'בהמשך לשיחתנו - IGV',
      body: `שלום {{name}},

רציתי לחזור אליך בהמשך לשיחתנו הקודמת על פרויקט ההתרחבות שלך בישראל.

האם היה לך זמן לשקול את ההצעה שלנו? אנחנו עומדים לרשותך לכל שאלה.

אל תהסס להתקשר או לקבוע מועד לשיחה נוספת.

בברכה,
צוות Israel Growth Venture`
    },
    {
      id: 'meeting',
      name: 'אישור פגישה',
      subject: 'אישור הפגישה שלך - IGV',
      body: `שלום {{name}},

אני מאשר את הפגישה שלנו שמתוכננת ל-[תאריך] ב-[שעה].

במהלך השיחה נדון ב:
- פרויקט ההתרחבות שלך בישראל
- הזדמנויות השוק הישראלי לתחום שלך
- פתרונות הליווי המותאמים שלנו

לקראת הפגישה, אני מזמין אותך לחשוב על הנקודות הבאות:
- היעדים שלך לטווח קצר ובינוני
- התקציב המשוער שלך
- השאלות הספציפיות שלך

להתראות בקרוב!

בברכה,
צוות Israel Growth Venture`
    },
    {
      id: 'proposal',
      name: 'שליחת הצעה',
      subject: 'ההצעה המותאמת שלך - IGV',
      body: `שלום {{name}},

בעקבות השיחה שלנו, אנא מצאי/מצא את ההצעה המותאמת אישית שלך לפרויקט ההתרחבות שלך בישראל.

ההצעה כוללת:
- ניתוח שוק ראשוני לתחום שלך
- המלצה לחבילת ליוו מומלצת
- פירוט השירותים והמחירים שלנו

אנחנו נשארים לרשותך המלאה לדון ולהתאים את ההצעה לפי הצרכים שלך.

בברכה,
צוות Israel Growth Venture`
    },
    {
      id: 'thank_you',
      name: 'תודה',
      subject: 'תודה על האמון שלך - IGV',
      body: `שלום {{name}},

אנחנו רוצים להודות לך על האמון שלך!

אנחנו שמחים ללוות אותך בפרויקט ההתרחבות שלך בישראל. הצוות שלנו מוכן לעשות הכל כדי להבטיח את הצלחת ההקמה שלך.

איש הקשר הייעודי שלך יצור איתך קשר בקרוב כדי להתחיל את השלבים הראשונים של הפרויקט שלך.

בברכה,
צוות Israel Growth Venture`
    }
  ]
};

const EmailModal = ({ contact, onClose, t, language = 'fr' }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const templates = EMAIL_TEMPLATES[language] || EMAIL_TEMPLATES.fr;

  const applyTemplate = (template) => {
    // Replace {{name}} with contact name
    const processedBody = template.body.replace(/\{\{name\}\}/g, contact.name || 'Client');
    setSubject(template.subject);
    setBody(processedBody);
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error(t('admin.crm.emails.error_empty'));
      return;
    }

    try {
      setSending(true);
      await api.post('/api/crm/emails/send', {
        contact_id: contact._id || contact.contact_id,
        to_email: contact.email,
        subject,
        message: body,  // Backend expects 'message' not 'body'
        template_id: selectedTemplate?.id
      });
      toast.success(t('admin.crm.emails.sent_success'));
      onClose();
    } catch (error) {
      console.error('Email send error:', error);
      toast.error(t('admin.crm.emails.send_failed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{t('admin.crm.emails.compose')}</h3>
            <p className="text-sm text-gray-600">{t('admin.crm.emails.to')}: {contact.name} &lt;{contact.email}&gt;</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector */}
        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <button
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              className="w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span>{selectedTemplate ? selectedTemplate.name : t('admin.crm.emails.select_template')}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showTemplateSelector ? 'rotate-180' : ''}`} />
            </button>
            
            {showTemplateSelector && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0 flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-gray-500 truncate">{template.subject}</p>
                    </div>
                    <span className="text-blue-600 opacity-0 group-hover:opacity-100 text-sm">{t('admin.crm.emails.use')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Form */}
        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.crm.emails.subject')}</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('admin.crm.emails.subject_placeholder')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.crm.emails.message')}</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder={t('admin.crm.emails.message_placeholder')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
                        {t('common.cancel')}
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('admin.crm.emails.sending')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t('admin.crm.emails.send')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
