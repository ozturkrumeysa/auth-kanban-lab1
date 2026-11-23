const crypto = require("crypto");
const { users } = require("./register");

function verifyPassword(password, storedHash) {
  const [salt, key] = storedHash.split(":");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(derivedKey, "hex"));
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function loginUser({ email, password }) {
  if (!email || !password) {
    return { status: 400, message: "E-posta ve şifre alanları zorunludur." };
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { status: 401, message: "E-posta veya şifre hatalı." };
  }

  const token = generateSessionToken();
  return {
    status: 200,
    message: "Giriş başarılı.",
    token,
    user: { id: user.id, username: user.username, email: user.email },
  };
}

module.exports = { loginUser, verifyPassword };
