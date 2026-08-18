import { formatInTimeZone } from "date-fns-tz";

export const ORG_TIMEZONE = "Asia/Kolkata";

export function todayInOrgTimezone() {
  return formatInTimeZone(new Date(), ORG_TIMEZONE, "yyyy-MM-dd");
}
