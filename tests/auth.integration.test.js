const assert = require("assert");
const { registerUser } = require("../backend/register");
const { loginUser } = require("../backend/login");
const { requestPasswordReset, resetPassword } = require("../backend/reset-password");

function runIntegrationTests() {
  const email = "test@example.com";

  // 1. Kullanıcı kaydı testi
  const regRes = registerUser({
    username: "testkullanici",
    email,
    password: "Password123",
  });
  assert.strictEqual(regRes.status, 201, "Kayıt başarılı (201) dönmeli");

  // 2. Aynı e-posta ile tekrar kayıt testi
  const dupRes = registerUser({
    username: "testkullanici2",
    email,
    password: "Password123",
  });
  assert.strictEqual(dupRes.status, 409, "Mevcut e-posta için 409 dönmeli");

  // 3. Doğru bilgilerle giriş testi
  const loginOk = loginUser({ email, password: "Password123" });
  assert.strictEqual(loginOk.status, 200, "Geçerli giriş 200 dönmeli");
  assert.ok(loginOk.token, "Oturum tokenı üretilmeli");

  // 4. Hatalı şifreyle giriş testi
  const loginFail = loginUser({ email, password: "WrongPassword" });
  assert.strictEqual(loginFail.status, 401, "Hatalı şifre 401 dönmeli");

  // 5. Şifre sıfırlama kodu oluşturma ve şifre güncelleme testi
  const reqReset = requestPasswordReset(email);
  assert.strictEqual(reqReset.status, 200, "Sıfırlama talebi 200 dönmeli");
  assert.ok(reqReset.resetToken, "Sıfırlama tokenı üretilmeli");

  const resetRes = resetPassword({
    email,
    token: reqReset.resetToken,
    newPassword: "NewPassword456",
  });
  assert.strictEqual(resetRes.status, 200, "Şifre güncelleme 200 dönmeli");

  // 6. Yeni şifre ile giriş ve eski şifre ile ret testi
  const oldLogin = loginUser({ email, password: "Password123" });
  assert.strictEqual(oldLogin.status, 401, "Eski şifre artık geçersiz olmalı");

  const newLogin = loginUser({ email, password: "NewPassword456" });
  assert.strictEqual(newLogin.status, 200, "Yeni şifre ile giriş 200 dönmeli");

  console.log("Tüm kimlik doğrulama entegrasyon testleri başarıyla geçti!");
}

runIntegrationTests();
