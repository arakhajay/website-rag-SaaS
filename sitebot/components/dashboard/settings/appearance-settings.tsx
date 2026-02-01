'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { type ChatbotSettings } from "@/app/actions/settings"

interface AppearanceSettingsProps {
    settings: ChatbotSettings
    onSave: (settings: ChatbotSettings) => void
}

const PRESET_COLORS = [
    '#dc2626', // red
    '#d97706', // orange
    '#eab308', // yellow
    '#84cc16', // lime
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#a855f7', // purple
    '#ec4899', // pink
    '#000000', // black
]

export function AppearanceSettings({ settings, onSave }: AppearanceSettingsProps) {
    const [appearance, setAppearance] = useState(settings.appearance || {})

    const handleChange = (key: keyof typeof appearance, value: string) => {
        setAppearance(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = () => {
        onSave({
            ...settings,
            appearance
        })
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-1">Customize the appearance of your bot</h2>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="widget-name">Bot name on the widget</Label>
                    <p className="text-xs text-muted-foreground">Bot name to be displayed in the chatbot</p>
                    <Input
                        id="widget-name"
                        value={appearance.widget_name || ''}
                        onChange={(e) => handleChange('widget_name', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subheading">Subheading (optional)</Label>
                    <p className="text-xs text-muted-foreground">Chatbot Subheading to be displayed in the chatbot</p>
                    <Input
                        id="subheading"
                        value={appearance.subheading || ''}
                        onChange={(e) => handleChange('subheading', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Accent Colour</Label>
                    <div className="flex gap-2 flex-wrap">
                        {PRESET_COLORS.map(color => (
                            <button
                                key={color}
                                className={`w-8 h-8 rounded-md border-2 transition-all ${appearance.accent_color === color ? 'border-primary scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleChange('accent_color', color)}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Widget position</Label>
                    <p className="text-xs text-muted-foreground">Choose the location of the widget</p>
                    <RadioGroup
                        value={appearance.position || 'right'}
                        onValueChange={(val) => handleChange('position', val)}
                        className="flex gap-4 mt-2"
                    >
                        <div className="flex flex-col items-center space-y-2">
                            <RadioGroupItem value="left" id="pos-left" className="peer sr-only" />
                            <Label htmlFor="pos-left" className="cursor-pointer border-2 border-muted hover:border-primary peer-data-[state=checked]:border-primary rounded-lg p-1">
                                <div className="w-24 h-16 bg-slate-100 relative rounded">
                                    <div className="absolute bottom-2 left-2 w-4 h-4 bg-slate-300 rounded-full"></div>
                                </div>
                            </Label>
                            <span className="text-xs">Left</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            <RadioGroupItem value="right" id="pos-right" className="peer sr-only" />
                            <Label htmlFor="pos-right" className="cursor-pointer border-2 border-muted hover:border-primary peer-data-[state=checked]:border-primary rounded-lg p-1">
                                <div className="w-24 h-16 bg-slate-100 relative rounded">
                                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-slate-300 rounded-full"></div>
                                </div>
                            </Label>
                            <span className="text-xs">Right</span>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="placeholder">Input Placeholder</Label>
                    <Input
                        id="placeholder"
                        value={appearance.placeholder || ''}
                        onChange={(e) => handleChange('placeholder', e.target.value)}
                    />
                </div>

                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </div>
    )
}
