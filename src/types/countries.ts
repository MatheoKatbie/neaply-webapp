import { COUNTRIES } from '@/lib/countries'

export type SelectMenuOption = (typeof COUNTRIES)[number]

export type CountryWithPhonePrefix = {
  title: string
  value: string
  phonePrefix: string
}
