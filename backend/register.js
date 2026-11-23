const crypto = require("crypto");

// Örnek bellek içi kullanıcı deposu
const users = [];

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function registerUser({ username, email, password }) {
  if (!username || !email || !password) {
    return { status: 400, message: "Kullanıcı adı, e-posta ve şifre zorunludur." };
  }

  if (password.length < 6) {
    return { status: 400, message: "Şifre en az 6 karakter olmalıdır." };
  }

  const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return { status: 409, message: "Bu e-posta adresi zaten kayıtlı." };
  }

  const newUser = {
    id: crypto.randomUUID(),
    username: username.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  return {
    status: 201,
    message: "Kullanıcı kaydı başarıyla oluşturuldu.",
    user: { id: newUser.id, username: newUser.username, email: newUser.email },
  };
}

module.exports = { registerUser, users };
