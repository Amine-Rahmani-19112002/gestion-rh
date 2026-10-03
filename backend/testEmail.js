require("dotenv").config();
const nodemailer = require("nodemailer");

/**
 * Script de test direct d'envoi d'e-mail réel via mot de passe d'application Gmail
 * Usage : node testEmail.js [destinataire]
 */
async function testSend() {
  const user = (process.env.MAIL || "").trim();
  const pass = (process.env.PASS || "").trim().replace(/\s+/g, "");
  const recipient = process.argv[2] || user;

  console.log("==========================================");
  console.log("🧪 TEST D'ENVOI D'E-MAIL - MOT DE PASSE D'APPLICATION");
  console.log("==========================================");
  console.log("Expéditeur (MAIL)       :", user || "❌ NON DÉFINI");
  console.log("Mot de passe (PASS)     :", pass ? "✅ Configuré" : "❌ MANQUANT");
  console.log("Destinataire du test    :", recipient || "❌ NON DÉFINI");
  console.log("------------------------------------------");

  if (!user || !pass) {
    console.error("❌ ERREUR : MAIL et PASS ne sont pas configurés dans backend/.env !");
    console.log("\nComplétez dans backend/.env :");
    console.log("MAIL=votre-email@gmail.com");
    console.log("PASS=votre_mot_de_passe_application_16_lettres");
    console.log("\n💡 Pour obtenir un mot de passe d'application Gmail :");
    console.log("1. Activez la validation en 2 étapes sur votre compte Google");
    console.log("2. Allez sur https://myaccount.google.com/apppasswords");
    console.log("3. Créez un mot de passe d'application et collez-le dans PASS");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });

  try {
    console.log("⏳ Vérification de la connexion SMTP...");
    await transporter.verify();
    console.log("✅ Connexion SMTP établie avec succès !");

    console.log(`⏳ Envoi de l'e-mail de test à ${recipient}...`);
    const fromName = process.env.EMAIL_FROM_NAME || "StratoxHR";
    const info = await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to: recipient,
      replyTo: user,
      subject: "StratoxHR - Test d'envoi",
      text: `Bonjour,\n\nCeci est un email de test valide envoye depuis StratoxHR pour confirmer la configuration de messagerie.\n\nAdresse utilisee : ${user}\nDate : ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 500px;">
          <h2 style="color: #2563eb; margin-top: 0;">Test d'envoi réussi</h2>
          <p>Cet e-mail confirme le bon fonctionnement du service de messagerie depuis l'adresse :</p>
          <p style="background: #ffffff; padding: 12px; border-radius: 8px; font-weight: bold; border: 1px solid #cbd5e1; color: #0f172a;">
            ${user}
          </p>
          <p style="color: #475569; font-size: 14px;">
            Le système d'invitation de <strong>StratoxHR</strong> est maintenant opérationnel.
          </p>
        </div>
      `,
    });

    console.log("✅ E-MAIL ENVOYÉ AVEC SUCCÈS !");
    console.log("Message ID :", info.messageId);
    console.log(`👉 Vérifiez la boîte de réception de : ${recipient}`);
  } catch (error) {
    console.error("❌ Échec de l'envoi :", error.message);
    if (error.message.includes("Invalid login") || error.message.includes("Username and Password not accepted")) {
      console.log("\n💡 Astuce pour Gmail :");
      console.log("Vous ne pouvez pas utiliser votre mot de passe Google habituel.");
      console.log("Vous devez créer un 'Mot de passe d'application' (16 lettres) ici :");
      console.log("https://myaccount.google.com/apppasswords");
    }
  }
}

testSend();

