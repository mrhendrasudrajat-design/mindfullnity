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
import { signIn, type AuthFormState } from "@/lib/supabase/auth"
import { authErrorMessage } from "@/lib/supabase/auth-errors"

export function LoginForm({ callbackError }: { callbackError?: string }) {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).auth
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signIn,
    undefined,
  )

  const errorKey = state?.error ?? (callbackError ? "callback" : undefined)
  const error = authErrorMessage(errorKey, copy)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{copy.login.title}</CardTitle>
        <CardDescription>{copy.login.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <FormField
            label={copy.login.email}
            inputProps={{
              id: "email",
              name: "email",
              type: "email",
              required: true,
              autoComplete: "email",
              placeholder: copy.login.emailPlaceholder,
            }}
          />
          <FormField
            label={copy.login.password}
            inputProps={{
              id: "password",
              name: "password",
              type: "password",
              required: true,
              autoComplete: "current-password",
              placeholder: copy.login.passwordPlaceholder,
            }}
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "…" : copy.login.submit}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="flex w-full items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>or</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleButton label={copy.login.google} />
        <p className="text-sm text-muted-foreground">
          {copy.login.noAccount}{" "}
          <Link href="/auth/signup" className="font-medium text-foreground underline underline-offset-4">
            {copy.login.signupLink}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
