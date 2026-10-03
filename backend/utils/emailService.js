const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

/**
 * Configure Nodemailer transport
 * Utilise simplement l'adresse email (MAIL) et le mot de passe d'application (PASS)
 */
const createTransporter = async () => {
  const user = (process.env.MAIL || process.env.SMTP_USER || "").trim();
  // Nettoyage automatique des espaces au cas où le mot de passe d'application a été copié avec des espaces
  const pass = (process.env.PASS || process.env.SMTP_PASS || "").trim().replace(/\s+/g, "");

  // Si l'adresse et le mot de passe sont renseignés :
  if (user && pass) {
    return {
      transporter: nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || "gmail",
        auth: {
          user: user,
          pass: pass,
        },
      }),
      isRealSmtp: true,
      provider: process.env.SMTP_SERVICE || "Gmail",
    };
  }

  // Mode de secours développement (si MAIL et PASS ne sont pas encore renseignés)
  try {
    const testAccount = await nodemailer.createTestAccount();
    return {
      transporter: nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }),
      isRealSmtp: false,
      provider: "Simulation Sandbox Locale",
    };
  } catch (err) {
    return {
      transporter: null,
      isRealSmtp: false,
      provider: "Simulateur Console",
    };
  }
};

/**
 * Construit l'adresse d'expéditeur RFC-compliant
 */
const getFromAddress = () => {
  const user = (process.env.MAIL || process.env.SMTP_USER || "").trim();
  const fromName = process.env.EMAIL_FROM_NAME || "StratoxHR";

  if (user) {
    return `"${fromName}" <${user}>`;
  }

  return `"${fromName}" <no-reply@stratoxhr.com>`;
};

/**
 * Send Registration Confirmation Email (Inscription)
 */
const sendRegistrationEmail = async ({ to, name, activationUrl, expiresHours = 48 }) => {
  const from = getFromAddress();
  const user = (process.env.MAIL || process.env.SMTP_USER || "").trim();
  const subject = "StratoxHR - Activation de votre compte";

  const text = `Bonjour ${name},\n\nBienvenue sur StratoxHR.\nPour activer votre compte, veuillez copier et ouvrir le lien suivant dans votre navigateur :\n${activationUrl}\n\nCe lien est valable pendant ${expiresHours} heures.\n\nCordialement,\nL'equipe StratoxHR`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8FAFC; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
        .header { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 36px 30px; text-align: center; }
        .logo { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .logo span { color: #38BDF8; }
        .badge { display: inline-block; margin-top: 10px; background: rgba(56, 189, 248, 0.15); color: #38BDF8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 9999px; }
        .body { padding: 40px 36px; color: #334155; line-height: 1.65; }
        .greeting { font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 16px; }
        .button-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #2563EB; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); }
        .callout { background-color: #F0FDF4; border-left: 4px solid #22C55E; border-radius: 0 10px 10px 0; padding: 14px 18px; margin: 24px 0; font-size: 13px; color: #166534; }
        .link-fallback { font-size: 12px; color: #64748B; word-break: break-all; margin-top: 20px; }
        .footer { background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 30px; text-align: center; font-size: 12px; color: #94A3B8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Stratox<span>HR</span></div>
          <div class="badge">Confirmation d'inscription</div>
        </div>
        <div class="body">
          <div class="greeting">Bonjour ${name},</div>
          <p>Bienvenue sur la plateforme <strong>StratoxHR</strong>.</p>
          <p>Votre compte a ete prepare. Pour finaliser votre inscription et activer votre acces, cliquez sur le bouton ci-dessous :</p>
          
          <div class="button-wrapper">
            <a href="${activationUrl}" class="btn" target="_blank">Activer mon compte</a>
          </div>

          <div class="callout">
            ⏱️ <strong>Validité :</strong> Ce lien d'activation sécurisé est valable pendant <strong>${expiresHours} heures</strong>.
          </div>

          <p class="link-fallback">
            Si le bouton ne fonctionne pas, copiez-collez ce lien direct dans votre navigateur :<br/>
            <a href="${activationUrl}" style="color: #2563EB;">${activationUrl}</a>
          </p>
        </div>
        <div class="footer">
          Cet e-mail est généré automatiquement par la plateforme StratoxHR.<br/>
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.
        </div>
      </div>
    </body>
    </html>
  `;

  const transportConfig = await createTransporter();
  const { transporter, isRealSmtp, provider } = transportConfig;

  console.log(`\n======================================================`);
  console.log(`📧 [SERVICE DE MAILING - INSCRIPTION EN LIGNE]`);
  console.log(`👤 Destinataire : ${to}`);
  console.log(`⚙️ Mode d'envoi : ${isRealSmtp ? '✅ EMAIL RÉEL ENVOYÉ (' + provider + ')' : '⚠️ SIMULATION LOCALE (Configurez MAIL et PASS dans backend/.env)'}`);
  console.log(`🔗 LIEN D'ACTIVATION : ${activationUrl}`);
  if (!isRealSmtp) {
    console.log(`ℹ️ Pour l'envoi réel, complétez MAIL et PASS dans backend/.env`);
  }
  console.log(`======================================================\n`);

  if (!transporter) {
    return { 
      success: true, 
      isRealEmailSent: false, 
      activationUrl,
      reason: "Aucun transporteur configuré." 
    };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      replyTo: user || undefined,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🌐 [Aperçu Sandbox Ethereal] : ${previewUrl}`);
    }

    return { 
      success: true, 
      isRealEmailSent: isRealSmtp, 
      messageId: info.messageId, 
      previewUrl,
      activationUrl 
    };
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email :", error.message);
    return { 
      success: false, 
      isRealEmailSent: false, 
      error: error.message, 
      activationUrl 
    };
  }
};

/**
 * Send Account Invitation Email
 */
const sendAccountInvitationEmail = async ({ to, name, activationUrl, expiresHours = 48 }) => {
  const from = getFromAddress();
  const user = (process.env.MAIL || process.env.SMTP_USER || "").trim();
  const subject = "StratoxHR - Invitation a rejoindre l'espace collaborateur";

  const text = `Bonjour ${name},\n\nUn compte collaborateur a ete cree pour vous sur la plateforme StratoxHR.\nPour activer votre compte et choisir votre mot de passe, ouvrez le lien suivant dans votre navigateur :\n${activationUrl}\n\nCe lien est securise et valable ${expiresHours} heures.\n\nCordialement,\nL'equipe RH`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8FAFC; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
        .header { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 36px 30px; text-align: center; }
        .logo { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .logo span { color: #38BDF8; }
        .badge { display: inline-block; margin-top: 10px; background: rgba(56, 189, 248, 0.15); color: #38BDF8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 9999px; }
        .body { padding: 40px 36px; color: #334155; line-height: 1.65; }
        .greeting { font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 16px; }
        .button-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #2563EB; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); }
        .callout { background-color: #F1F5F9; border-left: 4px solid #2563EB; border-radius: 0 10px 10px 0; padding: 14px 18px; margin: 24px 0; font-size: 13px; color: #475569; }
        .link-fallback { font-size: 12px; color: #64748B; word-break: break-all; margin-top: 20px; }
        .footer { background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 30px; text-align: center; font-size: 12px; color: #94A3B8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Stratox<span>HR</span></div>
          <div class="badge">Invitation Collaborateur</div>
        </div>
        <div class="body">
          <div class="greeting">Bonjour ${name},</div>
          <p>Un profil collaborateur a été créé pour vous sur la plateforme <strong>StratoxHR</strong> par votre administrateur.</p>
          <p>Pour des raisons de sécurité, vous devez définir vous-même votre mot de passe personnalisé pour activer votre accès.</p>
          
          <div class="button-wrapper">
            <a href="${activationUrl}" class="btn" target="_blank">Activer mon compte & Définir mon mot de passe</a>
          </div>

          <div class="callout">
            ⏱️ <strong>Important :</strong> Ce lien d'activation sécurisé est valable pendant <strong>${expiresHours} heures</strong>.
          </div>

          <p class="link-fallback">
            Si le bouton ne fonctionne pas, copiez et collez l'adresse suivante dans votre navigateur :<br/>
            <a href="${activationUrl}" style="color: #2563EB;">${activationUrl}</a>
          </p>
        </div>
        <div class="footer">
          Cet e-mail est confidentiel et généré automatiquement par StratoxHR.<br/>
          Ne répondez pas à ce message.
        </div>
      </div>
    </body>
    </html>
  `;

  const transportConfig = await createTransporter();
  const { transporter, isRealSmtp, provider } = transportConfig;

  console.log(`\n======================================================`);
  console.log(`📧 [SERVICE DE MAILING - INVITATION COLLABORATEUR]`);
  console.log(`👤 Destinataire : ${to}`);
  console.log(`⚙️ Mode d'envoi : ${isRealSmtp ? '✅ EMAIL RÉEL ENVOYÉ (' + provider + ')' : '⚠️ SIMULATION LOCALE (Configurez MAIL et PASS dans backend/.env)'}`);
  console.log(`🔗 LIEN D'ACTIVATION SÉCURISÉ :`);
  console.log(`   ${activationUrl}`);
  console.log(`📂 Copie HTML locale : backend/temp_emails/derniere-invitation.html`);
  if (!isRealSmtp) {
    console.log(`ℹ️ Pour l'envoi réel, complétez simplement MAIL et PASS dans backend/.env`);
  }
  console.log(`======================================================\n`);

  if (!transporter) {
    return { 
      success: true, 
      isRealEmailSent: false, 
      activationUrl,
      reason: "Aucun transporteur configuré. Utilisez le lien direct ci-dessus." 
    };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      replyTo: user || undefined,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🌐 [Aperçu de l'email généré dans la sandbox Ethereal] : ${previewUrl}`);
    }

    return { 
      success: true, 
      isRealEmailSent: isRealSmtp, 
      messageId: info.messageId, 
      previewUrl,
      activationUrl 
    };
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email :", error.message);
    return { 
      success: false, 
      isRealEmailSent: false, 
      error: error.message, 
      activationUrl 
    };
  }
};

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async ({ to, name, resetUrl, expiresMinutes = 60 }) => {
  const from = getFromAddress();
  const user = (process.env.MAIL || process.env.SMTP_USER || "").trim();
  const subject = "StratoxHR - Reinitialisation de votre mot de passe";

  const text = `Bonjour ${name || ""},\n\nUne demande de reinitialisation de votre mot de passe a ete effectuee.\nPour reinitialiser votre mot de passe, ouvrez le lien suivant dans votre navigateur :\n${resetUrl}\n\nCe lien est valable ${expiresMinutes} minutes.\nSi vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet e-mail.\n\nCordialement,\nL'equipe StratoxHR`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8FAFC; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
        .header { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 36px 30px; text-align: center; }
        .logo { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .logo span { color: #38BDF8; }
        .body { padding: 40px 36px; color: #334155; line-height: 1.65; }
        .greeting { font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 16px; }
        .button-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #2563EB; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); }
        .callout { background-color: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 0 10px 10px 0; padding: 14px 18px; margin: 24px 0; font-size: 13px; color: #78350F; }
        .link-fallback { font-size: 12px; color: #64748B; word-break: break-all; margin-top: 20px; }
        .footer { background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 30px; text-align: center; font-size: 12px; color: #94A3B8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Stratox<span>HR</span></div>
        </div>
        <div class="body">
          <div class="greeting">Bonjour ${name || ""},</div>
          <p>Une demande de réinitialisation de votre mot de passe a été initiée pour votre compte StratoxHR.</p>
          <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe sécurisé :</p>
          
          <div class="button-wrapper">
            <a href="${resetUrl}" class="btn" target="_blank">Réinitialiser mon mot de passe</a>
          </div>

          <div class="callout">
            🔒 <strong>Sécurité :</strong> Ce lien est valable pendant <strong>${expiresMinutes} minutes</strong>. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email : votre mot de passe actuel reste inchangé.
          </div>

          <p class="link-fallback">
            Lien direct :<br/>
            <a href="${resetUrl}" style="color: #2563EB;">${resetUrl}</a>
          </p>
        </div>
        <div class="footer">
          Cet e-mail est confidentiel et généré automatiquement par StratoxHR.
        </div>
      </div>
    </body>
    </html>
  `;

  const transportConfig = await createTransporter();
  const { transporter, isRealSmtp, provider } = transportConfig;

  console.log(`\n======================================================`);
  console.log(`🔑 [SERVICE DE MAILING - RÉINITIALISATION MOT DE PASSE]`);
  console.log(`👤 Destinataire : ${to}`);
  console.log(`⚙️ Mode d'envoi : ${isRealSmtp ? '✅ EMAIL RÉEL ENVOYÉ (' + provider + ')' : '⚠️ SIMULATION LOCALE (Configurez MAIL et PASS dans backend/.env)'}`);
  console.log(`🔗 LIEN DE RÉINITIALISATION :`);
  console.log(`   ${resetUrl}`);
  console.log(`======================================================\n`);

  if (!transporter) {
    return { success: true, isRealEmailSent: false, resetUrl };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      replyTo: user || undefined,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🌐 [Aperçu Ethereal] : ${previewUrl}`);
    }

    return { success: true, isRealEmailSent: isRealSmtp, messageId: info.messageId, previewUrl, resetUrl };
  } catch (error) {
    console.error("❌ Erreur envoi email réinitialisation :", error.message);
    return { success: false, isRealEmailSent: false, error: error.message, resetUrl };
  }
};

/**
 * Test transporter connectivity
 */
const testConnection = async () => {
  const config = await createTransporter();
  if (!config.transporter) {
    return { success: false, message: "Aucun transporteur configuré" };
  }
  try {
    await config.transporter.verify();
    return { success: true, isRealSmtp: config.isRealSmtp, provider: config.provider };
  } catch (err) {
    return { success: false, error: err.message, provider: config.provider };
  }
};

module.exports = {
  sendAccountInvitationEmail,
  sendPasswordResetEmail,
  sendRegistrationEmail,
  testConnection,
};
