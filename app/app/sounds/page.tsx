import type { Metadata } from "next"

import { SoundsPage } from "@/components/app/sounds/sounds-page"

export const metadata: Metadata = {
  title: "Suara Relaksasi",
}

export default function SoundsRoute() {
  return <SoundsPage />
}