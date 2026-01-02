'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        systemName: 'PatientFirst CRM',
        timeZone: 'UTC-05:00 (Eastern Time)',
        dateFormat: 'MM/DD/YYYY',
        emailNotifications: true,
        leadStatusChanges: true,
        newComments: false,
        dailySummary: true,
        twoFactorAuth: false,
        sessionTimeout: '30 minutes',
        passwordExpiration: '90 days',
        theme: 'Light',
        compactMode: false,
    });

    const handleSave = () => {
        console.log('Settings saved:', settings);
        alert('Settings saved successfully! (Data logged to console)');
    };

    const handleReset = () => {
        setSettings({
            systemName: 'PatientFirst CRM',
            timeZone: 'UTC-05:00 (Eastern Time)',
            dateFormat: 'MM/DD/YYYY',
            emailNotifications: true,
            leadStatusChanges: true,
            newComments: false,
            dailySummary: true,
            twoFactorAuth: false,
            sessionTimeout: '30 minutes',
            passwordExpiration: '90 days',
            theme: 'Light',
            compactMode: false,
        });
        alert('Settings reset to defaults!');
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content">
                <Topbar />

                <main className="content">
                    <div style={{ maxWidth: '800px' }}>
                        <div className="page-header">
                            <h2 className="page-title">Settings</h2>
                            <p className="page-subtitle">Manage your system preferences and configurations</p>
                        </div>

                        {/* General Settings */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div className="card-header">
                                <h3 className="card-title">General Settings</h3>
                            </div>
                            <div className="card-content">
                                <div className="settings-section">
                                    <div className="settings-item">
                                        <div className="settings-item-info">
                                            <h4>System Name</h4>
                                            <p>The name displayed across the application</p>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={settings.systemName}
                                            onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                                            style={{ width: '250px' }}
                                        />
                                    </div>

                                    <div className="settings-item">
                                        <div className="settings-item-info">
                                            <h4>Time Zone</h4>
                                            <p>Default time zone for the system</p>
                                        </div>
                                        <select
                                            className="form-input"
                                            value={settings.timeZone}
                                            onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
                                            style={{ width: '250px' }}
                                        >
                                            <option>UTC-05:00 (Eastern Time)</option>
                                            <option>UTC-06:00 (Central Time)</option>
                                            <option>UTC-07:00 (Mountain Time)</option>
                                            <option>UTC-08:00 (Pacific Time)</option>
                                        </select>
                                    </div>

                                    <div className="settings-item">
                                        <div className="settings-item-info">
                                            <h4>Date Format</h4>
                                            <p>How dates are displayed throughout the system</p>
                                        </div>
                                        <select
                                            className="form-input"
                                            value={settings.dateFormat}
                                            onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                                            style={{ width: '250px' }}
                                        >
                                            <option>MM/DD/YYYY</option>
                                            <option>DD/MM/YYYY</option>
                                            <option>YYYY-MM-DD</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div className="card-header">
                                <h3 className="card-title">Notification Settings</h3>
                            </div>
                            <div className="card-content">
                                <div className="settings-section">
                                    <div className="settings-item">
                                        <div className="settings-item-info">
                                            <h4>Email Notifications</h4>
                                            <p>Receive email alerts for important updates</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.emailNotifications}
                                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="settings-item">
                                        <div className="settings-item-info">
                                            <h4>Lead Status Changes</h4>
                                            <p>Get notified when lead status is updated</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.leadStatusChanges}
                                                onChange={(e) => setSettings({ ...settings, leadStatusChanges: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="settings-item">
                                        <div className="settings-item-info">
                                            <h4>New Comments</h4>
                                            <p>Receive alerts for new comments on leads</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.newComments}
                                                onChange={(e) => setSettings({ ...settings, newComments: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="settings-item">
                                        <div className="settings-item-info">
                                            <h4>Daily Summary</h4>
                                            <p>Get a daily email summary of activities</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.dailySummary}
                                                onChange={(e) => setSettings({ ...settings, dailySummary: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Settings */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div className="card-header">
                                <h3 className="card-title">Security Settings</h3>
                            </div>
                            <div className="card-content">
                                <div className="settings-section">
                                    <div className="settings-item">
                                        <div className="settings-item-info">
                                            <h4>Two-Factor Authentication</h4>
                                            <p>Add an extra layer of security to your account</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.twoFactorAuth}
                                                onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="settings-item">
                                        <div className="settings-item-info">
                                            <h4>Session Timeout</h4>
                                            <p>Automatically log out after period of inactivity</p>
                                        </div>
                                        <select
                                            className="form-input"
                                            value={settings.sessionTimeout}
                                            onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                                            style={{ width: '250px' }}
                                        >
                                            <option>15 minutes</option>
                                            <option>30 minutes</option>
                                            <option>1 hour</option>
                                            <option>2 hours</option>
                                            <option>Never</option>
                                        </select>
                                    </div>

                                    <div className="settings-item">
                                        <div className="settings-item-info">
                                            <h4>Password Expiration</h4>
                                            <p>Require password changes periodically</p>
                                        </div>
                                        <select
                                            className="form-input"
                                            value={settings.passwordExpiration}
                                            onChange={(e) => setSettings({ ...settings, passwordExpiration: e.target.value })}
                                            style={{ width: '250px' }}
                                        >
                                            <option>30 days</option>
                                            <option>90 days</option>
                                            <option>180 days</option>
                                            <option>Never</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Appearance Settings */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div className="card-header">
                                <h3 className="card-title">Appearance</h3>
                            </div>
                            <div className="card-content">
                                <div className="settings-section">
                                    <div className="settings-item">
                                        <div className="settings-item-info">
                                            <h4>Theme</h4>
                                            <p>Choose your preferred color theme</p>
                                        </div>
                                        <select
                                            className="form-input"
                                            value={settings.theme}
                                            onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                                            style={{ width: '250px' }}
                                        >
                                            <option>Light</option>
                                            <option>Dark</option>
                                            <option>Auto (System)</option>
                                        </select>
                                    </div>

                                    <div className="settings-item">
                                        <div className="settings-item-info">
                                            <h4>Compact Mode</h4>
                                            <p>Reduce spacing for a denser layout</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.compactMode}
                                                onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button type="button" className="btn-secondary" onClick={handleReset}>Reset to Defaults</button>
                            <button type="button" className="btn-primary" onClick={handleSave}>Save Settings</button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
