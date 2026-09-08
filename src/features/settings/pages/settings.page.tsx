import { SettingsAccount } from '../components/settings-account'
import { SettingsLinks } from '../components/settings-links'
import { SettingsSync } from '../components/settings-sync'
import { SETTINGS_TITLE } from '../constants/settings.constants'

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-ink text-xl">{SETTINGS_TITLE}</h1>

      <SettingsAccount />
      <SettingsLinks />
      <SettingsSync />
    </div>
  )
}
