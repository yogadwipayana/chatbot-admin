import type { Node, Resolved } from "@/lib/i18n/resolve"

import { auth, password } from "./auth"
import { api, app, common, roles } from "./core"
import { deleteDocument, docDetail, docStatus, documents, upload } from "./documents"
import { faq } from "./faq"
import { feedback, labels, unanswered } from "./log"
import { logs } from "./logs"
import { costs, range, stats } from "./metrics"
import { killSwitchBanner, nav, shell } from "./nav"
import { config, dateField, killSwitch, unitField } from "./settings"
import { scoreMeter, testQuery } from "./testQuery"
import { units } from "./units"
import { users } from "./users"

/**
 * Seluruh teks antarmuka dashboard.
 *
 * Satu pohon, dipecah per area agar berkasnya tetap terbaca. `satisfies Node`
 * menolak entri yang lupa salah satu bahasanya -- bentuk `[id, en]` wajib
 * sampai ke daun.
 */
export const DICT = {
  app,
  common,
  api,
  roles,
  nav,
  shell,
  killSwitchBanner,
  auth,
  password,
  docStatus,
  documents,
  deleteDocument,
  docDetail,
  upload,
  labels,
  unanswered,
  feedback,
  faq,
  range,
  stats,
  costs,
  logs,
  testQuery,
  scoreMeter,
  config,
  killSwitch,
  unitField,
  dateField,
  users,
  units,
} as const satisfies Node

export type Dict = Resolved<typeof DICT>
