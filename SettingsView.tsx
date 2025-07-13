import React from 'react';
import { AppSettings } from './types';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { LockClosedIcon } from './components/icons/LockClosedIcon';
import { useAppContext } from './context/AppContext';
import { auth } from './firebase';
import { LogoutIcon } from './components/icons/LogoutIcon';


const SettingsView: React.FC = () => {
  const { appData, setAppData } = useAppContext();
  const { settings } = appData;

  const toggleTheme = () => {
    setAppData(prev => ({
      ...prev,
      settings: { ...prev.settings, theme: prev.settings.theme === 'dark' ? 'light' : 'dark' },
    }));
  };
  
  const togglePin = () => {
    if (settings.isPinEnabled) {
      setAppData(prev => ({ ...prev, settings: { ...prev.settings, isPinEnabled: false, pin: null }}));
    } else {
      const newPin = prompt("Set your 4-digit PIN:");
      if (newPin && /^\d{4}$/.test(newPin)) {
         setAppData(prev => ({ ...prev, settings: { ...prev.settings, isPinEnabled: true, pin: newPin }}));
      } else if (newPin) {
        alert("Invalid PIN. Please enter exactly 4 digits.");
      }
    }
  }

  const handleSignOut = async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Error signing out: ", error);
        alert("Failed to sign out. Please try again.");
    }
  };


  const SettingRow: React.FC<{icon: React.ReactNode, label: string, children: React.ReactNode}> = ({ icon, label, children }) => (
    <div className="flex items-center justify-between p-4 border-b border-light-border-default dark:border-dark-border-default last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="text-light-fg-subtle dark:text-dark-fg-subtle">{icon}</div>
        <span className="font-medium text-light-fg-default dark:text-dark-fg-default">{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );

  return (
    <>
    <div className="bg-light-bg-subtle dark:bg-dark-bg-subtle rounded-2xl overflow-hidden border border-light-border-default dark:border-dark-border-default">
      <SettingRow label="Theme" icon={<SunIcon />}>
          <div className="flex items-center gap-1 bg-light-bg-inset dark:bg-dark-bg-inset p-1 rounded-full">
            <button onClick={() => settings.theme !== 'light' && toggleTheme()} className={`p-1.5 rounded-full ${settings.theme === 'light' ? 'bg-light-bg-subtle shadow' : 'text-light-fg-subtle dark:text-dark-fg-subtle'}`}>
                <SunIcon />
            </button>
            <button onClick={() => settings.theme !== 'dark' && toggleTheme()} className={`p-1.5 rounded-full ${settings.theme === 'dark' ? 'bg-dark-bg-default shadow' : 'text-light-fg-subtle dark:text-dark-fg-subtle'}`}>
                <MoonIcon />
            </button>
          </div>
      </SettingRow>
      <SettingRow label="App Lock (PIN)" icon={<LockClosedIcon />}>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.isPinEnabled} onChange={togglePin} className="sr-only peer" />
            <div className="w-11 h-6 bg-light-bg-inset dark:bg-dark-bg-inset peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
      </SettingRow>
    </div>

    <div className="mt-6">
        <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 text-left p-4 bg-light-bg-subtle dark:bg-dark-bg-subtle hover:bg-light-bg-inset dark:hover:bg-dark-bg-inset transition-colors rounded-2xl border border-light-border-default dark:border-dark-border-default"
        >
             <LogoutIcon className="text-destructive"/>
            <span className="font-medium text-destructive">Sign Out</span>
        </button>
    </div>
    </>
  );
};

export default SettingsView;