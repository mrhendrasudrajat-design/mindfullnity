import type { AppCopy } from "@/lib/i18n/app"

export function authErrorMessage(
  key: string | null | undefined,
  copy: AppCopy["auth"],
): string | null {
  if (!key) return null
  switch (key) {
    case "confirm-email":
      return copy.signup.confirmEmail
    case "callback":
      return copy.errors.callbackFailed
    case "Invalid login credentials":
      return copy.errors.invalidCredentials
    case "Email not confirmed":
      return copy.errors.emailNotConfirmed
    case "User already registered":
      return copy.errors.userExists
    case "Password should be at least 8 characters":
      return copy.errors.passwordTooShort
    default:
      return copy.error
  }
}
