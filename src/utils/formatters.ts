// Utility functions for formatting data

export const formatters = {
  // Date and time formatting
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    });
  },

  formatDateTime: (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatTimeAgo: (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const intervals = [
      { label: 'Jahr', seconds: 31536000 },
      { label: 'Monat', seconds: 2592000 },
      { label: 'Woche', seconds: 604800 },
      { label: 'Tag', seconds: 86400 },
      { label: 'Stunde', seconds: 3600 },
      { label: 'Minute', seconds: 60 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `vor ${count} ${interval.label}${count > 1 ? 'en' : ''}`;
      }
    }

    return 'gerade eben';
  },

  // Number and currency formatting
  formatCurrency: (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  formatNumber: (number: number, minimumFractionDigits = 0) => {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits,
      maximumFractionDigits: 2
    }).format(number);
  },

  formatPercentage: (value: number, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  formatKarma: (karma: number) => {
    if (karma >= 1000000) {
      return `${(karma / 1000000).toFixed(1)}M`;
    }
    if (karma >= 1000) {
      return `${(karma / 1000).toFixed(1)}K`;
    }
    return karma.toString();
  },

  // Text formatting
  truncateText: (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  },

  capitalizeFirst: (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  formatCamelCase: (str: string) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  },

  // Job-specific formatting
  formatPayment: (job: any) => {
    if (job.payment_type === 'cash') {
      const amount = job.cash_amount || 0;
      return formatters.formatCurrency(amount);
    } else if (job.payment_type === 'karma') {
      const amount = job.karma_amount || 0;
      return `${formatters.formatKarma(amount)} Karma`;
    } else if (job.payment_type === 'mixed') {
      const cash = job.cash_amount || 0;
      const karma = job.karma_amount || 0;
      return `${formatters.formatCurrency(cash)} + ${formatters.formatKarma(karma)} Karma`;
    }
    return 'Nicht festgelegt';
  },

  formatJobType: (type: string) => {
    const types: Record<string, string> = {
      'cash': 'Cash Job',
      'karma': 'Karma Job',
      'mixed': 'Gemischt'
    };
    return types[type] || formatters.capitalizeFirst(type);
  },

  formatJobStatus: (status: string) => {
    const statuses: Record<string, string> = {
      'open': 'Offen',
      'in_progress': 'In Bearbeitung',
      'completed': 'Abgeschlossen',
      'cancelled': 'Abgebrochen'
    };
    return statuses[status] || formatters.capitalizeFirst(status);
  },

  formatApplicationStatus: (status: string) => {
    const statuses: Record<string, string> = {
      'pending': 'Wartend',
      'accepted': 'Angenommen',
      'rejected': 'Abgelehnt',
      'withdrawn': 'Zurückgezogen'
    };
    return statuses[status] || formatters.capitalizeFirst(status);
  },

  formatDifficulty: (difficulty: string) => {
    const difficulties: Record<string, string> = {
      'easy': 'Einfach',
      'medium': 'Mittel',
      'hard': 'Schwer'
    };
    return difficulties[difficulty] || formatters.capitalizeFirst(difficulty);
  },

  // File size formatting
  formatFileSize: (bytes: number) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Duration formatting
  formatDuration: (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} Min`;
    }
    if (hours < 24) {
      return `${hours} Std`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days} Tag${days > 1 ? 'e' : ''}${remainingHours > 0 ? ` ${remainingHours} Std` : ''}`;
  },

  // URL formatting
  formatUrl: (url: string) => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  },

  // Phone formatting
  formatPhoneNumber: (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format German phone numbers
    if (cleaned.startsWith('49')) {
      return `+49 ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
    }
    if (cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    }
    
    return phone;
  }
};

// Export individual formatters for convenience
export const {
  formatDate,
  formatDateTime,
  formatTimeAgo,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatKarma,
  truncateText,
  capitalizeFirst,
  formatCamelCase,
  formatPayment,
  formatJobType,
  formatJobStatus,
  formatApplicationStatus,
  formatDifficulty,
  formatFileSize,
  formatDuration,
  formatUrl,
  formatPhoneNumber
} = formatters;