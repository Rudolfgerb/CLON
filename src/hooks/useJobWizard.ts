import { useState, useCallback } from 'react';

export interface JobWizardData {
  // Step 1: Basic Information
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  media: File[];
  titleImageIndex: number;

  // Step 2: Details & Requirements
  location: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string;
  requirements: string;
  deliverables: string;
  expectedDuration: string;
  timeCommitment: 'part_time' | 'full_time' | 'flexible';
  maxApplicants: string;
  requirePortfolio: boolean;

  // Step 3: Payment & Deadline
  deadlineDate: string;
  deadlineTime: string;
  budgetType: 'fixed' | 'hourly';
  cashAmount: string;
  hourlyRate: string;
  karmaAmount: string;
  additionalKarma: string;
  additionalCash: string;
  offerBothPayments: boolean;
}

export interface ApplicationWizardData {
  // Step 1: Personal Information
  fullName: string;
  email: string;
  phone: string;

  // Step 2: Application Details
  coverLetter: string;
  experience: string;
  portfolioUrl: string;
  proposedAmount: string;
  availability: string;

  // Step 3: Additional Information
  questions: string[];
  terms: boolean;
}

export interface WizardValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export const useJobCreationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JobWizardData>({
    // Step 1
    title: '',
    description: '',
    category: 'programming',
    priority: 'medium',
    media: [],
    titleImageIndex: 0,

    // Step 2
    location: 'remote',
    difficulty: 'medium',
    tags: '',
    requirements: '',
    deliverables: '',
    expectedDuration: '8',
    timeCommitment: 'part_time',
    maxApplicants: '10',
    requirePortfolio: false,

    // Step 3
    deadlineDate: '',
    deadlineTime: '',
    budgetType: 'fixed',
    cashAmount: '',
    hourlyRate: '',
    karmaAmount: '100',
    additionalKarma: '',
    additionalCash: '',
    offerBothPayments: false,
  });

  const updateFormData = useCallback((field: keyof JobWizardData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const validateStep = useCallback((step: number): WizardValidation => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          errors.title = 'Titel ist erforderlich';
        }
        if (!formData.description.trim()) {
          errors.description = 'Beschreibung ist erforderlich';
        }
        if (!formData.category) {
          errors.category = 'Kategorie ist erforderlich';
        }
        break;

      case 2:
        if (!formData.deliverables.trim()) {
          errors.deliverables = 'Lieferobjekte sind erforderlich';
        }
        if (!formData.expectedDuration || parseInt(formData.expectedDuration) <= 0) {
          errors.expectedDuration = 'Gültige Dauer ist erforderlich';
        }
        break;

      case 3:
        if (!formData.deadlineDate) {
          errors.deadlineDate = 'Deadline-Datum ist erforderlich';
        }
        if (!formData.deadlineTime) {
          errors.deadlineTime = 'Deadline-Zeit ist erforderlich';
        }
        
        // Validate payment based on type
        if (formData.budgetType === 'fixed') {
          if (!formData.cashAmount || parseFloat(formData.cashAmount) <= 0) {
            errors.cashAmount = 'Gültiger Betrag ist erforderlich';
          }
        } else {
          if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
            errors.hourlyRate = 'Gültiger Stundensatz ist erforderlich';
          }
        }

        // Check if deadline is in the future
        if (formData.deadlineDate && formData.deadlineTime) {
          const deadline = new Date(`${formData.deadlineDate}T${formData.deadlineTime}`);
          if (deadline <= new Date()) {
            errors.deadline = 'Deadline muss in der Zukunft liegen';
          }
        }
        break;

      default:
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [formData]);

  const nextStep = useCallback(() => {
    const validation = validateStep(currentStep);
    if (validation.isValid && currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      return true;
    }
    return false;
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setFormData({
      title: '',
      description: '',
      category: 'programming',
      priority: 'medium',
      media: [],
      titleImageIndex: 0,
      location: 'remote',
      difficulty: 'medium',
      tags: '',
      requirements: '',
      deliverables: '',
      expectedDuration: '8',
      timeCommitment: 'part_time',
      maxApplicants: '10',
      requirePortfolio: false,
      deadlineDate: '',
      deadlineTime: '',
      budgetType: 'fixed',
      cashAmount: '',
      hourlyRate: '',
      karmaAmount: '100',
      additionalKarma: '',
      additionalCash: '',
      offerBothPayments: false,
    });
  }, []);

  return {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    resetWizard,
    validateStep,
    totalSteps: 3
  };
};

export const useApplicationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationWizardData>({
    // Step 1
    fullName: '',
    email: '',
    phone: '',

    // Step 2
    coverLetter: '',
    experience: '',
    portfolioUrl: '',
    proposedAmount: '',
    availability: '',

    // Step 3
    questions: [],
    terms: false
  });

  const updateFormData = useCallback((field: keyof ApplicationWizardData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const validateStep = useCallback((step: number): WizardValidation => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.fullName.trim()) {
          errors.fullName = 'Name ist erforderlich';
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
          errors.email = 'Gültige E-Mail ist erforderlich';
        }
        break;

      case 2:
        if (!formData.coverLetter.trim() || formData.coverLetter.length < 50) {
          errors.coverLetter = 'Anschreiben mit mindestens 50 Zeichen ist erforderlich';
        }
        break;

      case 3:
        if (!formData.terms) {
          errors.terms = 'Nutzungsbedingungen müssen akzeptiert werden';
        }
        break;

      default:
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [formData]);

  const nextStep = useCallback(() => {
    const validation = validateStep(currentStep);
    if (validation.isValid && currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      return true;
    }
    return false;
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      coverLetter: '',
      experience: '',
      portfolioUrl: '',
      proposedAmount: '',
      availability: '',
      questions: [],
      terms: false
    });
  }, []);

  return {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    resetWizard,
    validateStep,
    totalSteps: 3
  };
};