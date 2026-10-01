import type { PublicLeagueProduct } from '@bdl/player-public-contract'

export type PlayerGenderSelfReport =
  | 'male'
  | 'female'
  | 'non_binary'
  | 'unknown'
  | null

export type RegistrationEligibilityResult =
  | { ok: true }
  | { ok: false; code: 'gender_mismatch' | 'division_unavailable'; message: string }

export function checkRegistrationEligibility(input: {
  product: Pick<PublicLeagueProduct, 'gender' | 'eventFormat'>
  playerGender: PlayerGenderSelfReport
  requestedDivision: string | null
}): RegistrationEligibilityResult {
  if (input.product.gender === 'she_they' && input.playerGender === 'male') {
    return {
      ok: false,
      code: 'gender_mismatch',
      message: 'This product is she/they only (placeholder rule).',
    }
  }

  if (input.requestedDivision?.trim()) {
    return {
      ok: false,
      code: 'division_unavailable',
      message: 'Division selection is not available yet.',
    }
  }

  return { ok: true }
}
