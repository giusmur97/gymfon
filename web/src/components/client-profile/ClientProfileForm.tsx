'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  phone?: string;
  address?: string;
  profession?: string;
  generalNotes?: string;
}

interface SportsAnamnesis {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  activitiesPracticed: string[];
  previousTrainerExperience?: string;
  fitnessGoals: string[];
  preferredActivities: string[];
}

interface PhysiologicalAnamnesis {
  sleepHours: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  lifestyle: 'sedentary' | 'moderately_active' | 'active' | 'very_active';
  smokingHabits: 'never' | 'former' | 'occasional' | 'regular';
  alcoholConsumption: 'never' | 'occasional' | 'moderate' | 'frequent';
  waterIntake: number;
  bowelRegularity: 'regular' | 'irregular' | 'constipated';
  menstrualCycle?: 'regular' | 'irregular' | 'absent';
}

interface MedicalCondition {
  name: string;
  diagnosisDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  isActive: boolean;
  notes?: string;
}

interface Injury {
  type: string;
  date: string;
  bodyPart: string;
  limitations: string[];
  isResolved: boolean;
}

interface PathologicalAnamnesis {
  conditions: MedicalCondition[];
  allergies: string[];
  intolerances: string[];
  injuries: Injury[];
  surgeries: Array<{
    type: string;
    date: string;
    notes?: string;
  }>;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate?: string;
  }>;
}

interface NutritionDiary {
  dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'other';
  mealsPerDay: number;
  skippedMeals: string[];
  snackingHabits?: string;
  dailyMealDescription?: string;
  foodPreferences: string[];
  foodDislikes: string[];
  meals?: {
    breakfast?: string;
    midMorning?: string;
    lunch?: string;
    afternoonSnack?: string;
    dinner?: string;
  };
}

interface ClientProfile {
  personalInfo?: PersonalInfo;
  sportsHistory?: SportsAnamnesis;
  physiologicalHistory?: PhysiologicalAnamnesis;
  pathologicalHistory?: PathologicalAnamnesis;
  nutritionDiary?: NutritionDiary;
  generalInfo?: {
    profession?: string;
    workHoursPerDay?: number;
    sleepHoursPerNight?: number;
    jobType?: 'fisso' | 'turnista' | 'autonomo' | 'studente' | 'disoccupato' | 'altro';
    lifestyle?: 'sedentario' | 'dinamico' | 'molto_dinamico';
    sleepQuality?: 'regolare' | 'non_regolare';
  };
  addressDetails?: {
    street: string;
    number: string;
    city: string;
    province: string;
    zip?: string;
  };
  trainingPreferences?: {
    trainingMode?: 'casa' | 'palestra';
    equipment?: string[];
    sessionsPerWeek?: number;
    maxSessionDurationMinutes?: number;
    goal?: 'dimagrimento' | 'tonificazione' | 'massa' | 'preparazione_atletica' | 'riabilitazione' | 'benessere' | 'altro';
  };
  supplementation?: {
    usedInPast?: boolean;
    currentUse?: string[];
  };
  eligibility?: {
    selfCertificationGiven?: boolean;
    medicalCertificateDocumentId?: string;
  };
  privacyConsents?: {
    generalPrivacy: boolean;
    healthData: boolean;
    marketing?: boolean;
    medicalSharing?: boolean;
    termsAccepted: boolean;
  };
}

interface ClientProfileFormProps {
  clientId: string;
  initialData?: ClientProfile;
  onSave?: (data: ClientProfile) => void;
  readOnly?: boolean;
}

type TabType =
  | 'personalInfo'
  | 'addressDetails'
  | 'generalInfo'
  | 'sportsHistory'
  | 'physiologicalHistory'
  | 'pathologicalHistory'
  | 'nutritionDiary'
  | 'trainingPreferences'
  | 'supplementation'
  | 'eligibility'
  | 'privacyConsents'
  | 'progressPhotos';

const tabs: { id: TabType; label: string; description: string }[] = [
  { id: 'personalInfo', label: 'Anagrafica', description: 'Informazioni personali del cliente' },
  { id: 'addressDetails', label: 'Residenza', description: 'Indirizzo di residenza' },
  { id: 'generalInfo', label: 'Info Generali', description: 'Lavoro, sonno e stile di vita' },
  { id: 'sportsHistory', label: 'Anamnesi Sportiva', description: 'Storia sportiva e obiettivi fitness' },
  { id: 'physiologicalHistory', label: 'Anamnesi Fisiologica', description: 'Stile di vita e abitudini' },
  { id: 'pathologicalHistory', label: 'Anamnesi Patologica', description: 'Condizioni mediche e infortuni' },
  { id: 'nutritionDiary', label: 'Diario Alimentare', description: 'Abitudini e preferenze alimentari' },
  { id: 'trainingPreferences', label: 'Allenamento', description: 'Modalità, attrezzatura, frequenza e obiettivi' },
  { id: 'supplementation', label: 'Integrazione', description: 'Uso di integratori' },
  { id: 'eligibility', label: 'Idoneità', description: 'Autocertificazione e certificato medico' },
  { id: 'privacyConsents', label: 'Privacy e Consensi', description: 'Consensi GDPR e termini' },
  { id: 'progressPhotos', label: 'Foto Progressi', description: 'Carica foto frontale, posteriore e laterali' },
];

export default function ClientProfileForm({ 
  clientId, 
  initialData = {}, 
  onSave, 
  readOnly = false 
}: ClientProfileFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('personalInfo');
  const [formData, setFormData] = useState<ClientProfile>(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSaveSection = async (section: TabType, data: any) => {
    setLoading(true);
    setErrors({});

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/profile/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details) {
          const fieldErrors: Record<string, string> = {};
          errorData.details.forEach((error: any) => {
            fieldErrors[error.path.join('.')] = error.message;
          });
          setErrors(fieldErrors);
        }
        throw new Error(errorData.error || 'Failed to save');
      }

      const result = await response.json();
      setFormData(prev => ({ ...prev, [section]: data }));
      onSave?.(formData);
      
      // Show success message
      alert('Sezione salvata con successo!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Errore nel salvataggio. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfoForm = () => {
    const data = formData.personalInfo || {} as PersonalInfo;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome *</label>
            <input
              type="text"
              value={data.firstName || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                personalInfo: { ...data, firstName: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
              required
            />
            {errors['firstName'] && <p className="text-red-500 text-sm mt-1">{errors['firstName']}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cognome *</label>
            <input
              type="text"
              value={data.lastName || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                personalInfo: { ...data, lastName: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
              required
            />
            {errors['lastName'] && <p className="text-red-500 text-sm mt-1">{errors['lastName']}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data di Nascita *</label>
            <input
              type="date"
              value={data.birthDate || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                personalInfo: { ...data, birthDate: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
              required
            />
            {errors['birthDate'] && <p className="text-red-500 text-sm mt-1">{errors['birthDate']}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Luogo di Nascita *</label>
            <input
              type="text"
              value={data.birthPlace || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                personalInfo: { ...data, birthPlace: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
              required
            />
            {errors['birthPlace'] && <p className="text-red-500 text-sm mt-1">{errors['birthPlace']}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telefono</label>
            <input
              type="tel"
              value={data.phone || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                personalInfo: { ...data, phone: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Professione</label>
            <input
              type="text"
              value={data.profession || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                personalInfo: { ...data, profession: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Indirizzo</label>
          <textarea
            value={data.address || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...data, address: e.target.value }
            }))}
            rows={2}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Note Generali</label>
          <textarea
            value={data.generalNotes || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...data, generalNotes: e.target.value }
            }))}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={readOnly}
          />
        </div>

        {!readOnly && (
          <button
            onClick={() => handleSaveSection('personalInfo', formData.personalInfo)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salva Anagrafica'}
          </button>
        )}
      </div>
    );
  };

  const renderSportsHistoryForm = () => {
    const data = formData.sportsHistory || {} as SportsAnamnesis;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Livello di Esperienza *</label>
            <select
              value={data.experienceLevel || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                sportsHistory: { ...data, experienceLevel: e.target.value as any }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
              required
            >
              <option value="">Seleziona livello</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzato</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Obiettivi Fitness *</label>
          <div className="space-y-2">
            {['Perdita di peso', 'Aumento massa muscolare', 'Miglioramento resistenza', 'Tonificazione', 'Riabilitazione', 'Benessere generale'].map((goal) => (
              <label key={goal} className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.fitnessGoals?.includes(goal) || false}
                  onChange={(e) => {
                    const goals = data.fitnessGoals || [];
                    const newGoals = e.target.checked 
                      ? [...goals, goal]
                      : goals.filter(g => g !== goal);
                    setFormData(prev => ({
                      ...prev,
                      sportsHistory: { ...data, fitnessGoals: newGoals }
                    }));
                  }}
                  className="mr-2"
                  disabled={readOnly}
                />
                {goal}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Attività Praticate</label>
          <div className="space-y-2">
            {['Palestra', 'Corsa', 'Nuoto', 'Ciclismo', 'Yoga', 'Pilates', 'Calcio', 'Tennis', 'Arti marziali', 'Danza'].map((activity) => (
              <label key={activity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.activitiesPracticed?.includes(activity) || false}
                  onChange={(e) => {
                    const activities = data.activitiesPracticed || [];
                    const newActivities = e.target.checked 
                      ? [...activities, activity]
                      : activities.filter(a => a !== activity);
                    setFormData(prev => ({
                      ...prev,
                      sportsHistory: { ...data, activitiesPracticed: newActivities }
                    }));
                  }}
                  className="mr-2"
                  disabled={readOnly}
                />
                {activity}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Esperienza Precedente con Personal Trainer</label>
          <textarea
            value={data.previousTrainerExperience || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              sportsHistory: { ...data, previousTrainerExperience: e.target.value }
            }))}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={readOnly}
          />
        </div>

        {!readOnly && (
          <button
            onClick={() => handleSaveSection('sportsHistory', formData.sportsHistory)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salva Anamnesi Sportiva'}
          </button>
        )}
      </div>
    );
  };

  const renderAddressDetailsForm = () => {
    const data = formData.addressDetails || ({} as any);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Via *</label>
            <input
              type="text"
              value={data.street || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                addressDetails: { ...data, street: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Numero *</label>
            <input
              type="text"
              value={data.number || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                addressDetails: { ...data, number: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Città *</label>
            <input
              type="text"
              value={data.city || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                addressDetails: { ...data, city: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Provincia *</label>
            <input
              type="text"
              value={data.province || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                addressDetails: { ...data, province: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CAP</label>
            <input
              type="text"
              value={data.zip || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                addressDetails: { ...data, zip: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            />
          </div>
        </div>

        {!readOnly && (
          <button
            onClick={() => handleSaveSection('addressDetails' as any, formData.addressDetails)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salva Residenza'}
          </button>
        )}
      </div>
    );
  };

  const renderGeneralInfoForm = () => {
    const data = formData.generalInfo || ({} as any);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ore lavorative al giorno</label>
            <input
              type="number"
              min={0}
              max={24}
              value={data.workHoursPerDay ?? ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                generalInfo: { ...data, workHoursPerDay: Number(e.target.value) }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ore di sonno per notte</label>
            <input
              type="number"
              min={0}
              max={24}
              value={data.sleepHoursPerNight ?? ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                generalInfo: { ...data, sleepHoursPerNight: Number(e.target.value) }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipologia di lavoro</label>
            <select
              value={data.jobType || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                generalInfo: { ...data, jobType: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            >
              <option value="">Seleziona</option>
              <option value="fisso">Fisso</option>
              <option value="turnista">Turnista</option>
              <option value="autonomo">Autonomo</option>
              <option value="studente">Studente</option>
              <option value="disoccupato">Disoccupato</option>
              <option value="altro">Altro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Stile di vita</label>
            <select
              value={data.lifestyle || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                generalInfo: { ...data, lifestyle: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            >
              <option value="">Seleziona</option>
              <option value="sedentario">Sedentario</option>
              <option value="dinamico">Dinamico</option>
              <option value="molto_dinamico">Molto dinamico</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Qualità del sonno</label>
            <select
              value={data.sleepQuality || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                generalInfo: { ...data, sleepQuality: e.target.value }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            >
              <option value="">Seleziona</option>
              <option value="regolare">Regolare</option>
              <option value="non_regolare">Non regolare</option>
            </select>
          </div>
        </div>

        {!readOnly && (
          <button
            onClick={() => handleSaveSection('generalInfo' as any, formData.generalInfo)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salva Info Generali'}
          </button>
        )}
      </div>
    );
  };

  const renderPrivacyConsentsForm = () => {
    const data = formData.privacyConsents || ({} as any);

    const toggle = (key: string) => (e: any) => setFormData(prev => ({
      ...prev,
      privacyConsents: { ...data, [key]: e.target.checked }
    }));

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" checked={!!data.generalPrivacy} onChange={toggle('generalPrivacy')} disabled={readOnly} className="mr-2" />
            Consenso trattamento dati personali (obbligatorio)
          </label>
          <label className="flex items-center">
            <input type="checkbox" checked={!!data.healthData} onChange={toggle('healthData')} disabled={readOnly} className="mr-2" />
            Consenso trattamento dati sensibili (art. 9 GDPR)
          </label>
          <label className="flex items-center">
            <input type="checkbox" checked={!!data.marketing} onChange={toggle('marketing')} disabled={readOnly} className="mr-2" />
            Consenso per fini informativi/promozionali (opzionale)
          </label>
          <label className="flex items-center">
            <input type="checkbox" checked={!!data.medicalSharing} onChange={toggle('medicalSharing')} disabled={readOnly} className="mr-2" />
            Consenso per comunicazione a medici/studi partner (opzionale)
          </label>
          <label className="flex items-center">
            <input type="checkbox" checked={!!data.termsAccepted} onChange={toggle('termsAccepted')} disabled={readOnly} className="mr-2" />
            Accettazione termini e condizioni (obbligatorio)
          </label>
        </div>

        {!readOnly && (
          <button
            onClick={() => handleSaveSection('privacyConsents' as any, formData.privacyConsents)}
            disabled={loading || !data.generalPrivacy || !data.healthData || !data.termsAccepted}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salva Consensi'}
          </button>
        )}
      </div>
    );
  };

  const renderPhysiologicalForm = () => {
    const data = formData.physiologicalHistory || ({} as PhysiologicalAnamnesis);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ore di sonno</label>
            <input
              type="number"
              min={0}
              max={24}
              value={data.sleepHours ?? ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                physiologicalHistory: { ...data, sleepHours: Number(e.target.value) }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Qualità del sonno</label>
            <select
              value={data.sleepQuality || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                physiologicalHistory: { ...data, sleepQuality: e.target.value as any }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            >
              <option value="">Seleziona</option>
              <option value="poor">Scarsa</option>
              <option value="fair">Discreta</option>
              <option value="good">Buona</option>
              <option value="excellent">Ottima</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Litri d'acqua/giorno</label>
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={data.waterIntake ?? ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                physiologicalHistory: { ...data, waterIntake: Number(e.target.value) }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Stile di vita</label>
            <select
              value={data.lifestyle || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                physiologicalHistory: { ...data, lifestyle: e.target.value as any }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            >
              <option value="">Seleziona</option>
              <option value="sedentary">Sedentario</option>
              <option value="moderately_active">Moderatamente attivo</option>
              <option value="active">Attivo</option>
              <option value="very_active">Molto attivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fumo</label>
            <select
              value={data.smokingHabits || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                physiologicalHistory: { ...data, smokingHabits: e.target.value as any }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            >
              <option value="">Seleziona</option>
              <option value="never">Mai</option>
              <option value="former">Ex fumatore</option>
              <option value="occasional">Occasionale</option>
              <option value="regular">Regolare</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Consumo alcol</label>
            <select
              value={data.alcoholConsumption || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                physiologicalHistory: { ...data, alcoholConsumption: e.target.value as any }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            >
              <option value="">Seleziona</option>
              <option value="never">Mai</option>
              <option value="occasional">Occasionale</option>
              <option value="moderate">Moderato</option>
              <option value="frequent">Frequente</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Regolarità intestinale</label>
            <select
              value={data.bowelRegularity || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                physiologicalHistory: { ...data, bowelRegularity: e.target.value as any }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            >
              <option value="">Seleziona</option>
              <option value="regular">Regolare</option>
              <option value="irregular">Non regolare</option>
              <option value="constipated">Stipsi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ciclo mestruale</label>
            <select
              value={data.menstrualCycle || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                physiologicalHistory: { ...data, menstrualCycle: e.target.value as any }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            >
              <option value="">Seleziona</option>
              <option value="regular">Regolare</option>
              <option value="irregular">Non regolare</option>
              <option value="absent">Assente</option>
            </select>
          </div>
        </div>

        {!readOnly && (
          <button
            onClick={() => handleSaveSection('physiologicalHistory', formData.physiologicalHistory)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salva Anamnesi Fisiologica'}
          </button>
        )}
      </div>
    );
  };

  const renderPathologicalForm = () => {
    const data = formData.pathologicalHistory || ({} as PathologicalAnamnesis);

    const textToArray = (t?: string) => (t ? t.split(',').map(s => s.trim()).filter(Boolean) : []);
    const arrayToText = (arr?: string[]) => (arr && arr.length ? arr.join(', ') : '');

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Patologie (es: tiroide, diabete)</label>
          <input
            type="text"
            value={arrayToText(data.conditions?.map(c => c.name))}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              pathologicalHistory: {
                ...data,
                conditions: textToArray(e.target.value).map(name => ({ name, diagnosisDate: new Date().toISOString().slice(0,10), severity: 'mild', isActive: true }))
              }
            }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={readOnly}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Allergie</label>
            <input
              type="text"
              value={arrayToText(data.allergies)}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                pathologicalHistory: { ...data, allergies: textToArray(e.target.value) }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Intolleranze</label>
            <input
              type="text"
              value={arrayToText(data.intolerances)}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                pathologicalHistory: { ...data, intolerances: textToArray(e.target.value) }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Farmaci (nome, opz:dosaggio)</label>
          <input
            type="text"
            value={arrayToText(data.medications?.map(m => `${m.name} ${m.dosage ?? ''}`.trim()))}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              pathologicalHistory: {
                ...data,
                medications: textToArray(e.target.value).map(s => ({ name: s, dosage: '', frequency: '' }))
              }
            }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={readOnly}
          />
        </div>

        {!readOnly && (
          <button
            onClick={() => handleSaveSection('pathologicalHistory', formData.pathologicalHistory)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salva Anamnesi Patologica'}
          </button>
        )}
      </div>
    );
  };

  const renderNutritionDiaryForm = () => {
    const data = formData.nutritionDiary || ({} as NutritionDiary);

    const toggleSkipped = (name: string) => (e: any) => {
      const arr = data.skippedMeals || [];
      const next = e.target.checked ? [...arr, name] : arr.filter(x => x !== name);
      setFormData(prev => ({ ...prev, nutritionDiary: { ...data, skippedMeals: next } }));
    };

    const setMeals = (key: keyof NonNullable<NutritionDiary['meals']>, value: string) => {
      setFormData(prev => ({ ...prev, nutritionDiary: { ...data, meals: { ...(data.meals || {}), [key]: value } } }));
    };

    const setCSV = (key: keyof NutritionDiary, v: string) => {
      const arr = v ? v.split(',').map(s => s.trim()).filter(Boolean) : [];
      setFormData(prev => ({ ...prev, nutritionDiary: { ...data, [key]: arr } as any }));
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo di dieta</label>
            <select
              value={data.dietType || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, nutritionDiary: { ...data, dietType: e.target.value as any } }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            >
              <option value="">Seleziona</option>
              <option value="omnivore">Onnivoro</option>
              <option value="vegetarian">Vegetariano</option>
              <option value="vegan">Vegano</option>
              <option value="pescatarian">Pescetariano</option>
              <option value="other">Altro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Pasti/giorno</label>
            <input
              type="number"
              min={1}
              max={10}
              value={data.mealsPerDay ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, nutritionDiary: { ...data, mealsPerDay: Number(e.target.value) } }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Pasti saltati (seleziona)</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              ['colazione','Colazione'],
              ['metà_mattina','Metà mattina'],
              ['pranzo','Pranzo'],
              ['merenda','Merenda'],
              ['cena','Cena'],
            ].map(([key,label]) => (
              <label key={key} className="flex items-center">
                <input type="checkbox" className="mr-2" checked={!!(data.skippedMeals||[]).includes(key)} onChange={toggleSkipped(key)} disabled={readOnly} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Colazione</label>
            <input type="text" value={data.meals?.breakfast || ''} onChange={(e) => setMeals('breakfast', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Metà mattina</label>
            <input type="text" value={data.meals?.midMorning || ''} onChange={(e) => setMeals('midMorning', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Pranzo</label>
            <input type="text" value={data.meals?.lunch || ''} onChange={(e) => setMeals('lunch', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Merenda</label>
            <input type="text" value={data.meals?.afternoonSnack || ''} onChange={(e) => setMeals('afternoonSnack', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cena</label>
            <input type="text" value={data.meals?.dinner || ''} onChange={(e) => setMeals('dinner', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={readOnly} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Preferenze alimentari (csv)</label>
            <input type="text" value={(data.foodPreferences||[]).join(', ')} onChange={(e)=>setCSV('foodPreferences', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Alimenti non graditi (csv)</label>
            <input type="text" value={(data.foodDislikes||[]).join(', ')} onChange={(e)=>setCSV('foodDislikes', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={readOnly} />
          </div>
        </div>

        {!readOnly && (
          <button
            onClick={() => handleSaveSection('nutritionDiary', formData.nutritionDiary)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salva Diario Alimentare'}
          </button>
        )}
      </div>
    );
  };

  const renderTrainingPreferencesForm = () => {
    const data = formData.trainingPreferences || ({} as any);
    const equipmentList = ['fitball','elastici','manubri','corda','cavigliere','kettlebell','sbarra','panca'];
    const toggleEquip = (name: string) => (e: any) => {
      const arr = data.equipment || [];
      const next = e.target.checked ? [...arr, name] : arr.filter((x: string) => x !== name);
      setFormData(prev => ({ ...prev, trainingPreferences: { ...data, equipment: next } }));
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Modalità</label>
            <select
              value={data.trainingMode || ''}
              onChange={(e)=>setFormData(prev=>({ ...prev, trainingPreferences: { ...data, trainingMode: e.target.value } }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={readOnly}
            >
              <option value="">Seleziona</option>
              <option value="casa">Casa</option>
              <option value="palestra">Palestra</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Frequenza settimanale</label>
            <input type="number" min={0} max={14} value={data.sessionsPerWeek ?? ''} onChange={(e)=>setFormData(prev=>({ ...prev, trainingPreferences: { ...data, sessionsPerWeek: Number(e.target.value) } }))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Durata massima (min)</label>
            <input type="number" min={10} max={240} value={data.maxSessionDurationMinutes ?? ''} onChange={(e)=>setFormData(prev=>({ ...prev, trainingPreferences: { ...data, maxSessionDurationMinutes: Number(e.target.value) } }))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={readOnly} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Attrezzatura disponibile</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {equipmentList.map(eq => (
              <label key={eq} className="flex items-center">
                <input type="checkbox" className="mr-2" checked={!!(data.equipment||[]).includes(eq)} onChange={toggleEquip(eq)} disabled={readOnly} />
                {eq}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Obiettivo</label>
          <select
            value={data.goal || ''}
            onChange={(e)=>setFormData(prev=>({ ...prev, trainingPreferences: { ...data, goal: e.target.value } }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={readOnly}
          >
            <option value="">Seleziona</option>
            <option value="dimagrimento">Dimagrimento</option>
            <option value="tonificazione">Tonificazione</option>
            <option value="massa">Massa</option>
            <option value="preparazione_atletica">Preparazione atletica</option>
            <option value="riabilitazione">Riabilitazione</option>
            <option value="benessere">Benessere</option>
            <option value="altro">Altro</option>
          </select>
        </div>

        {!readOnly && (
          <button
            onClick={() => handleSaveSection('trainingPreferences' as any, formData.trainingPreferences)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salva Allenamento'}
          </button>
        )}
      </div>
    );
  };

  const renderSupplementationForm = () => {
    const data = formData.supplementation || ({} as any);
    const setCSV = (v: string) => {
      const arr = v ? v.split(',').map(s => s.trim()).filter(Boolean) : [];
      setFormData(prev => ({ ...prev, supplementation: { ...data, currentUse: arr } }));
    };

    return (
      <div className="space-y-6">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" checked={!!data.usedInPast} onChange={(e)=>setFormData(prev=>({ ...prev, supplementation: { ...data, usedInPast: e.target.checked } }))} disabled={readOnly} />
          Uso di integratori in passato
        </label>

        <div>
          <label className="block text-sm font-medium mb-2">Integratori attuali (csv)</label>
          <input type="text" value={(data.currentUse||[]).join(', ')} onChange={(e)=>setCSV(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={readOnly} />
        </div>

        {!readOnly && (
          <button
            onClick={() => handleSaveSection('supplementation' as any, formData.supplementation)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salva Integrazione'}
          </button>
        )}
      </div>
    );
  };

  const renderEligibilityForm = () => {
    const data = formData.eligibility || ({} as any);

    return (
      <div className="space-y-6">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" checked={!!data.selfCertificationGiven} onChange={(e)=>setFormData(prev=>({ ...prev, eligibility: { ...data, selfCertificationGiven: e.target.checked } }))} disabled={readOnly} />
          Autocertificazione idoneità sportiva confermata
        </label>

        <div>
          <label className="block text-sm font-medium mb-2">ID certificato medico (documento caricato)</label>
          <input type="text" value={data.medicalCertificateDocumentId || ''} onChange={(e)=>setFormData(prev=>({ ...prev, eligibility: { ...data, medicalCertificateDocumentId: e.target.value } }))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={readOnly} />
          <p className="text-xs text-gray-500 mt-1">Caricamento file disponibile nella sezione Documenti; collega qui l'ID.</p>
        </div>

        {!readOnly && (
          <button
            onClick={() => handleSaveSection('eligibility' as any, formData.eligibility)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salva Idoneità'}
          </button>
        )}
      </div>
    );
  };

  const renderProgressPhotos = () => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

    const upload = async (type: 'front' | 'back' | 'side_right' | 'side_left', file: File) => {
      const form = new FormData();
      form.append('document', file);
      form.append('clientId', clientId);
      form.append('type', type === 'front' || type === 'back' ? 'progress' : 'progress');
      form.append('name', `photo_${type}`);

      try {
        const res = await fetch(`${API}/api/documents/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token || ''}` },
          body: form as any,
        });
        if (!res.ok) throw new Error('Upload fallito');
        alert('Foto caricata');
      } catch (e) {
        alert('Errore nel caricamento');
      }
    };

    const onFile = (type: any) => (e: any) => {
      const file = e.target.files?.[0];
      if (file) upload(type, file);
    };

    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">Carica le foto di progresso (usa JPEG/PNG). Il caricamento salva il file nei documenti del cliente.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Frontale</label>
            <input type="file" accept="image/*" onChange={onFile('front')} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Posteriore</label>
            <input type="file" accept="image/*" onChange={onFile('back')} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Lato destro</label>
            <input type="file" accept="image/*" onChange={onFile('side_right')} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Lato sinistro</label>
            <input type="file" accept="image/*" onChange={onFile('side_left')} disabled={readOnly} />
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'personalInfo':
        return renderPersonalInfoForm();
      case 'addressDetails':
        return renderAddressDetailsForm();
      case 'generalInfo':
        return renderGeneralInfoForm();
      case 'sportsHistory':
        return renderSportsHistoryForm();
      case 'physiologicalHistory':
        return renderPhysiologicalForm();
      case 'pathologicalHistory':
        return renderPathologicalForm();
      case 'nutritionDiary':
        return renderNutritionDiaryForm();
      case 'trainingPreferences':
        return renderTrainingPreferencesForm();
      case 'supplementation':
        return renderSupplementationForm();
      case 'eligibility':
        return renderEligibilityForm();
      case 'privacyConsents':
        return renderPrivacyConsentsForm();
      case 'progressPhotos':
        return renderProgressPhotos();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Profilo Cliente</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gestisci le informazioni complete del cliente organizzate per sezioni
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {renderCurrentTab()}
      </Card>
    </div>
  );
}