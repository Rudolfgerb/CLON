import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

interface NotificationPayload {
  event_type: string;
  recipient_id: string;
  data: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { event_type, recipient_id, data }: NotificationPayload = await req.json();

    // Get user preferences and contact info
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email, full_name, notification_preferences')
      .eq('id', recipient_id)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    // Get email template
    const emailTemplate = getEmailTemplate(event_type, data, user);
    
    // Send email notification
    if (emailTemplate && user.email) {
      await sendEmail(user.email, emailTemplate);
    }

    // Send push notification
    const pushTemplate = getPushTemplate(event_type, data);
    if (pushTemplate) {
      await sendPushNotification(recipient_id, pushTemplate);
    }

    // Record notification in database
    await supabase.from('notifications').insert({
      user_id: recipient_id,
      type: event_type,
      title: emailTemplate?.subject || pushTemplate?.title || 'Benachrichtigung',
      message: emailTemplate?.preview || pushTemplate?.body || 'Sie haben eine neue Benachrichtigung',
      data: data
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const err = error as { message?: string };
    console.error('Notification error:', error);
    
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getEmailTemplate(eventType: string, data: any, user: any) {
  const templates = {
    NEW_APPLICATION: {
      subject: `Neue Bewerbung für "${data.job_title}"`,
      preview: `${data.applicant_name} hat sich für Ihren Job beworben`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Neue Bewerbung erhalten!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Hallo ${user.full_name},</p>
            <p><strong>${data.applicant_name}</strong> hat sich für Ihren Job beworben:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${data.job_title}</h3>
              <p style="margin: 0; color: #666;">${data.application_message}</p>
            </div>
            <a href="${Deno.env.get('VITE_APP_URL')}/jobs/${data.job_id}/applications" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Bewerbung ansehen
            </a>
          </div>
        </div>
      `
    },
    APPLICATION_ACCEPTED: {
      subject: 'Glückwunsch! Ihre Bewerbung wurde angenommen',
      preview: `Sie wurden für den Job "${data.job_title}" ausgewählt`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Bewerbung angenommen!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Hallo ${user.full_name},</p>
            <p>Großartige Neuigkeiten! Sie wurden für folgenden Job ausgewählt:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${data.job_title}</h3>
              <p style="margin: 0; color: #666;">Zahlung: ${data.payment_info}</p>
            </div>
            <p>Nächste Schritte:</p>
            <ul style="color: #666;">
              <li>Kontaktieren Sie den Auftraggeber</li>
              <li>Beginnen Sie mit der Arbeit</li>
              <li>Markieren Sie den Job als abgeschlossen wenn fertig</li>
            </ul>
          </div>
        </div>
      `
    },
    JOB_COMPLETED: {
      subject: 'Job abgeschlossen - Bewertung abgeben',
      preview: `Der Job "${data.job_title}" wurde erfolgreich abgeschlossen`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Job erfolgreich abgeschlossen!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Hallo ${user.full_name},</p>
            <p>Der Job "${data.job_title}" wurde erfolgreich abgeschlossen.</p>
            ${data.payment_amount ? `<p>💰 <strong>€${data.payment_amount}</strong> wurde Ihrem Konto gutgeschrieben.</p>` : ''}
            ${data.karma_amount ? `<p>⭐ <strong>${data.karma_amount} Karma Punkte</strong> wurden Ihrem Konto gutgeschrieben.</p>` : ''}
            <a href="${Deno.env.get('VITE_APP_URL')}/jobs/${data.job_id}/review" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Bewertung abgeben
            </a>
          </div>
        </div>
      `
    }
  };

  return templates[eventType as keyof typeof templates];
}

function getPushTemplate(eventType: string, data: any) {
  const templates = {
    NEW_APPLICATION: {
      title: 'Neue Bewerbung',
      body: `${data.applicant_name} hat sich für "${data.job_title}" beworben`,
      data: { job_id: data.job_id, type: 'application' }
    },
    APPLICATION_ACCEPTED: {
      title: '🎉 Bewerbung angenommen!',
      body: `Sie wurden für "${data.job_title}" ausgewählt`,
      data: { job_id: data.job_id, type: 'accepted' }
    },
    JOB_COMPLETED: {
      title: 'Job abgeschlossen',
      body: `"${data.job_title}" wurde erfolgreich abgeschlossen`,
      data: { job_id: data.job_id, type: 'completed' }
    }
  };

  return templates[eventType as keyof typeof templates];
}

async function sendEmail(to: string, template: any) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('FROM_EMAIL') || 'noreply@mutuus-app.de',
        to: to,
        subject: template.subject,
        html: template.html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

async function sendPushNotification(userId: string, template: any) {
  // Implementation depends on your push service (OneSignal, Firebase, etc.)
  const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
  const oneSignalApiKey = Deno.env.get('ONESIGNAL_API_KEY');
  
  if (!oneSignalAppId || !oneSignalApiKey) {
    console.warn('Push notification service not configured');
    return;
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${oneSignalApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        include_external_user_ids: [userId],
        headings: { en: template.title },
        contents: { en: template.body },
        data: template.data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send push notification: ${response.statusText}`);
    }

    console.log('Push notification sent successfully to:', userId);
  } catch (error) {
    console.error('Push notification failed:', error);
  }
}