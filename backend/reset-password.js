const crypto = require("crypto");
const { users } = require("./register");

const resetTokens = new Map();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function requestPasswordReset(email) {
  if (!email) {
    return { status: 400, message: "E-posta adresi zorunludur." };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find((u) => u.email === normalizedEmail);
  if (!user) {
    return { status: 404, message: "Bu e-posta adresine kayıtlı kullanıcı bulunamadı." };
  }

  const token = crypto.randomBytes(24).toString("hex");
  resetTokens.set(normalizedEmail, {
    token,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 dakika geçerli
  });

  return {
    status: 200,
    message: "Şifre sıfırlama bağlantısı oluşturuldu.",
    resetToken: token,
  };
}

function resetPassword({ email, token, newPassword }) {
  if (!email || !token || !newPassword) {
    return { status: 400, message: "E-posta, doğrulama kodu ve yeni şifre zorunludur." };
  }

  if (newPassword.length < 6) {
    return { status: 400, message: "Yeni şifre en az 6 karakter olmalıdır." };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const record = resetTokens.get(normalizedEmail);
  if (!record || record.token !== token || Date.now() > record.expiresAt) {
    return { status: 400, message: "Geçersiz veya süresi dolmuş sıfırlama kodu." };
  }

  const user = users.find((u) => u.email === normalizedEmail);
  if (!user) {
    return { status: 404, message: "Kullanıcı bulunamadı." };
  }

  user.passwordHash = hashPassword(newPassword);
  resetTokens.delete(normalizedEmail);

  return {
    status: 200,
    message: "Şifreniz başarıyla güncellendi.",
  };
}

module.exports = { requestPasswordReset, resetPassword, resetTokens };
