"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase/client"

export default function SupabaseTestPage() {
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.auth.getSession()
      console.log("session:", data)
      console.log("error:", error)
    }

    test()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      Supabase connected ✔  
      <br />
      Check console
    </div>
  )
}
