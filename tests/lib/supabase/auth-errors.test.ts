import { describe, expect, it } from "vitest"

import { getAppCopy } from "@/lib/i18n/app"
import { authErrorMessage } from "@/lib/supabase/auth-errors"

describe("authErrorMessage", () => {
  const copy = getAppCopy("id").auth

  it("returns null for no error", () => {
    expect(authErrorMessage(undefined, copy)).toBeNull()
    expect(authErrorMessage(null, copy)).toBeNull()
  })

  it("maps known supabase messages to localized text", () => {
    expect(authErrorMessage("Invalid login credentials", copy)).toBe(
      "Email atau kata sandi salah.",
    )
    expect(authErrorMessage("Email not confirmed", copy)).toBe(
      "Email belum dikonfirmasi. Cek kotak masukmu.",
    )
    expect(authErrorMessage("User already registered", copy)).toBe(
      "Email sudah terdaftar. Coba masuk.",
    )
    expect(authErrorMessage("Password should be at least 8 characters", copy)).toBe(
      "Kata sandi minimal 8 karakter.",
    )
  })

  it("maps app-level sentinels", () => {
    expect(authErrorMessage("confirm-email", copy)).toBe(copy.signup.confirmEmail)
    expect(authErrorMessage("callback", copy)).toBe(copy.errors.callbackFailed)
  })

  it("falls back to the generic error", () => {
    expect(authErrorMessage("Something strange", copy)).toBe(copy.error)
  })

  it("produces English messages for the en locale", () => {
    const en = getAppCopy("en").auth
    expect(authErrorMessage("Invalid login credentials", en)).toBe(
      "Incorrect email or password.",
    )
  })
})