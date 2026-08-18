"use client"

import { useActionState } from "react"
import Link from "next/link"

import { GoogleButton } from "@/components/auth/google-button"
import { FormField } from "@/components/auth/form-field"
import { useLocale } from "@/components/providers/language-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getAppCopy } from "@/lib/i18n/app"
import { signUp, type AuthFormState } from "@/lib/supabase/auth"
import { authErrorMessage } from "@/lib/supabase/auth-errors"

export function SignupForm() {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).auth
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signUp,
    undefined,
  )

  const error = authErrorMessage(state?.error, copy)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{copy.signup.title}</CardTitle>
        <CardDescription>{copy.signup.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <FormField
            label={copy.signup.email}
            inputProps={{
              id: "email",
              name: "email",
              type: "email",
              required: true,
              autoComplete: "email",
              placeholder: copy.signup.emailPlaceholder,
            }}
          />
          <FormField
            label={copy.signup.password}
            inputProps={{
              id: "password",
              name: "password",
              type: "password",
              required: true,
              minLength: 8,
              autoComplete: "new-password",
              placeholder: copy.signup.passwordPlaceholder,
            }}
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "…" : copy.signup.submit}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="flex w-full items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>or</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleButton label={copy.signup.google} />
        <p className="text-sm text-muted-foreground">
          {copy.signup.haveAccount}{" "}
          <Link
            href="/auth/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            {copy.signup.loginLink}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
