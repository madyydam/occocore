"use client";

import React from "react";
import { X, Check } from "lucide-react";
import { useDemo } from "@/lib/demo/demoContext";
import { THEME_COLOR_PRESETS } from "@/lib/admin/themeUtils";

interface DemoCustomizeThemeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoCustomizeThemeDrawer({
  isOpen,
  onClose,
}: DemoCustomizeThemeDrawerProps) {
  const { brandColor, setBrandColor, theme } = useDemo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between">
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-serif">
                  Demo Theme Customizer
                </h2>
                <p className="text-xs text-slate-500">
                  Switch the primary branding color across the entire interface.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active Swatch */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Active Color Preview
              </span>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl shadow-md border border-white shrink-0"
                  style={{ backgroundColor: theme.primary }}
                />
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900 block">
                    {brandColor}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Calculated Header &amp; Sidebar Tone
                  </span>
                </div>
              </div>
            </div>

            {/* Curated Presets */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Curated Presets
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {THEME_COLOR_PRESETS.map((preset) => {
                  const isSelected = brandColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      onClick={() => setBrandColor(preset.hex)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-slate-900 ring-2 ring-slate-900/10 bg-slate-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg shadow-2xs shrink-0 flex items-center justify-center text-white"
                        style={{ backgroundColor: preset.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hex Picker */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Custom Hex Value
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-10 h-9 rounded-lg border border-slate-200 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
            <button
              onClick={onClose}
              style={{ backgroundColor: theme.primary }}
              className="px-5 py-2 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
