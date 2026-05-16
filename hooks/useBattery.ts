'use client';
import { useEffect, useState } from 'react';

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<{
    level: number;
    charging: boolean;
    addEventListener: (event: string, cb: () => void) => void;
    removeEventListener: (event: string, cb: () => void) => void;
  }>;
};

export type BatteryStatus = {
  level: number | null;
  charging: boolean | null;
};

export function useBattery(): BatteryStatus {
  const [status, setStatus] = useState<BatteryStatus>({ level: null, charging: null });

  useEffect(() => {
    let cancelled = false;
    const nav = navigator as NavigatorWithBattery;
    if (typeof nav.getBattery !== 'function') return;

    let battery: Awaited<ReturnType<NonNullable<NavigatorWithBattery['getBattery']>>> | null = null;
    const update = () => {
      if (battery && !cancelled) {
        setStatus({ level: battery.level, charging: battery.charging });
      }
    };

    nav.getBattery().then((b) => {
      if (cancelled) return;
      battery = b;
      update();
      b.addEventListener('levelchange', update);
      b.addEventListener('chargingchange', update);
    });

    return () => {
      cancelled = true;
      if (battery) {
        battery.removeEventListener('levelchange', update);
        battery.removeEventListener('chargingchange', update);
      }
    };
  }, []);

  return status;
}
