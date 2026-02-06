"use client"

import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Sign in with your Google account to continue.
      </p>
      <Button onClick={signInWithGoogle} size="lg">
        Continue with Google
      </Button>
    </div>
  )
}
