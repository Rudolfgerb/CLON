// Validation utilities for forms and data
export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validate?: (value: any) => boolean;
}

export interface ValidationRules {
  [field: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class Validator {
  static validateField(value: any, rules: ValidationRule[]): string | null {
    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && !value.trim())) {
            return rule.message;
          }
          break;

        case 'email':
          if (value && !this.isValidEmail(value)) {
            return rule.message;
          }
          break;

        case 'minLength':
          if (value && value.length < rule.value) {
            return rule.message;
          }
          break;

        case 'maxLength':
          if (value && value.length > rule.value) {
            return rule.message;
          }
          break;

        case 'pattern':
          if (value && !new RegExp(rule.value).test(value)) {
            return rule.message;
          }
          break;

        case 'custom':
          if (rule.validate && !rule.validate(value)) {
            return rule.message;
          }
          break;

        default:
          break;
      }
    }
    return null;
  }

  static validateForm(data: Record<string, any>, rules: ValidationRules): ValidationResult {
    const errors: Record<string, string> = {};

    Object.entries(rules).forEach(([field, fieldRules]) => {
      const error = this.validateField(data[field], fieldRules);
      if (error) {
        errors[field] = error;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidPhoneNumber(phone: string): boolean {
    // Basic phone validation - adjust regex as needed
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static sanitizeInput(input: string): string {
    // Basic XSS prevention
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Job-specific validations
  static validateJobData(jobData: any, jobType: 'cash' | 'karma'): ValidationResult {
    const rules: ValidationRules = {
      title: [
        { type: 'required', message: 'Titel ist erforderlich' },
        { type: 'minLength', value: 3, message: 'Titel muss mindestens 3 Zeichen haben' },
        { type: 'maxLength', value: 200, message: 'Titel darf nicht länger als 200 Zeichen sein' }
      ],
      description: [
        { type: 'required', message: 'Beschreibung ist erforderlich' },
        { type: 'minLength', value: 50, message: 'Beschreibung muss mindestens 50 Zeichen haben' }
      ],
      category: [
        { type: 'required', message: 'Kategorie ist erforderlich' }
      ],
      deliverables: [
        { type: 'required', message: 'Lieferobjekte sind erforderlich' },
        { type: 'minLength', value: 20, message: 'Bitte beschreiben Sie detailliert was geliefert werden soll' }
      ],
      deadline: [
        { 
          type: 'custom', 
          message: 'Deadline muss in der Zukunft liegen',
          validate: (deadline) => {
            if (!deadline) return false;
            return new Date(deadline) > new Date();
          }
        }
      ]
    };

    // Add payment-specific validation
    if (jobType === 'cash') {
      if (jobData.budgetType === 'fixed') {
        rules.cashAmount = [
          { type: 'required', message: 'Betrag ist erforderlich' },
          { 
            type: 'custom', 
            message: 'Betrag muss größer als 0 sein',
            validate: (amount) => parseFloat(amount) > 0
          }
        ];
      } else {
        rules.hourlyRate = [
          { type: 'required', message: 'Stundensatz ist erforderlich' },
          { 
            type: 'custom', 
            message: 'Stundensatz muss größer als 0 sein',
            validate: (rate) => parseFloat(rate) > 0
          }
        ];
      }
    } else {
      rules.karmaAmount = [
        { type: 'required', message: 'Karma-Punkte sind erforderlich' },
        { 
          type: 'custom', 
          message: 'Karma muss mindestens 10 Punkte sein',
          validate: (karma) => parseInt(karma) >= 10
        }
      ];
    }

    return this.validateForm(jobData, rules);
  }

  // Application-specific validations
  static validateApplicationData(applicationData: any): ValidationResult {
    const rules: ValidationRules = {
      fullName: [
        { type: 'required', message: 'Name ist erforderlich' },
        { type: 'minLength', value: 2, message: 'Name muss mindestens 2 Zeichen haben' }
      ],
      email: [
        { type: 'required', message: 'E-Mail ist erforderlich' },
        { type: 'email', message: 'Gültige E-Mail-Adresse ist erforderlich' }
      ],
      coverLetter: [
        { type: 'required', message: 'Anschreiben ist erforderlich' },
        { type: 'minLength', value: 50, message: 'Anschreiben muss mindestens 50 Zeichen haben' }
      ],
      terms: [
        { 
          type: 'custom', 
          message: 'Nutzungsbedingungen müssen akzeptiert werden',
          validate: (accepted) => accepted === true
        }
      ]
    };

    // Validate portfolio URL if provided
    if (applicationData.portfolioUrl) {
      rules.portfolioUrl = [
        { 
          type: 'custom', 
          message: 'Ungültige URL',
          validate: (url) => this.isValidUrl(url)
        }
      ];
    }

    // Validate phone if provided
    if (applicationData.phone) {
      rules.phone = [
        { 
          type: 'custom', 
          message: 'Ungültige Telefonnummer',
          validate: (phone) => this.isValidPhoneNumber(phone)
        }
      ];
    }

    return this.validateForm(applicationData, rules);
  }
}

// Export commonly used validation rules
export const commonValidationRules = {
  required: (message = 'Dieses Feld ist erforderlich'): ValidationRule => ({
    type: 'required',
    message
  }),

  email: (message = 'Gültige E-Mail-Adresse ist erforderlich'): ValidationRule => ({
    type: 'email',
    message
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    type: 'minLength',
    value: length,
    message: message || `Mindestens ${length} Zeichen erforderlich`
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    value: length,
    message: message || `Maximal ${length} Zeichen erlaubt`
  }),

  pattern: (pattern: string, message: string): ValidationRule => ({
    type: 'pattern',
    value: pattern,
    message
  }),

  custom: (validate: (value: any) => boolean, message: string): ValidationRule => ({
    type: 'custom',
    validate,
    message
  })
};