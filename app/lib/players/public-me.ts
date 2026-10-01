import {
  findForbiddenKeys,
  isSelfReportedSkill,
  type SelfReportedSkill,
} from '@bdl/player-public-contract'

export type PublicMeResponse = {
  email: string
  firstName: string | null
  lastName: string | null
  selfReportedSkill: SelfReportedSkill | null
}

export function toPublicMe(input: {
  email: string
  firstName: string | null
  lastName: string | null
  selfReportedSkill: string | null
}): PublicMeResponse {
  const skill =
    input.selfReportedSkill && isSelfReportedSkill(input.selfReportedSkill)
      ? input.selfReportedSkill
      : null
  const body: PublicMeResponse = {
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    selfReportedSkill: skill,
  }
  const forbidden = findForbiddenKeys(body)
  if (forbidden.length > 0) {
    throw new Error(`Public profile contains forbidden keys: ${forbidden.join(', ')}`)
  }
  return body
}
