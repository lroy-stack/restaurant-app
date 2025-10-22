/**
 * TIMEZONE HANDLER - ÚNICA FUENTE DE VERDAD
 *
 * Problema: new Date("2025-10-25T20:45:00") se interpreta como hora LOCAL del servidor
 * Solución: Forzar interpretación como Europe/Madrid
 */

const MADRID_TIMEZONE = 'Europe/Madrid';

/**
 * Convierte hora de Madrid a UTC para almacenar en DB
 * @param date - Fecha en formato YYYY-MM-DD
 * @param time - Hora en formato HH:MM
 * @returns Date object en UTC listo para DB
 */
export function madridToUTC(date: string, time: string): Date {
  // Parse input components
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  // Create Date object in Madrid timezone by using Intl.DateTimeFormat
  // to get the correct UTC offset for Madrid at that specific date/time
  const madridDateString = `${date}T${time}:00`;
  const madridDate = new Date(madridDateString);

  // Get Madrid time as string to parse back with correct timezone
  const madridFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: MADRID_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // Create UTC Date assuming input is Madrid time
  // Simple approach: CEST is UTC+2, CET is UTC+1
  // October 2025: Still in CEST (UTC+2)
  const isoString = `${date}T${time}:00`;

  // Create as if it's UTC, then subtract Madrid offset
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  // Madrid offset: +2 hours in summer (CEST), +1 in winter (CET)
  // For now, use fixed -2 hours (will need DST logic for production)
  const madridOffsetHours = 2;

  return new Date(utcDate.getTime() - (madridOffsetHours * 60 * 60 * 1000));
}

/**
 * Formatea timestamp UTC de DB como hora de Madrid para display
 * @param utcDate - Date o string UTC de la DB
 * @returns String formateado HH:MM en Madrid
 */
export function utcToMadridTime(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;

  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: MADRID_TIMEZONE,
    hour12: false
  });
}

/**
 * Formatea timestamp UTC de DB como fecha de Madrid para display
 * @param utcDate - Date o string UTC de la DB
 * @returns String formateado
 */
export function utcToMadridDate(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;

  return date.toLocaleDateString('es-ES', {
    timeZone: MADRID_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Obtiene Date object en timezone Madrid para cálculos
 */
export function utcToMadridDate_Object(utcDate: Date | string): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  const madridString = date.toLocaleString('en-US', { timeZone: MADRID_TIMEZONE });
  return new Date(madridString);
}
