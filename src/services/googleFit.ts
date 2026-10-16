import type { GoogleFitActivityData } from '../types';

export async function fetchGoogleFitDailyActivity(accessToken: string): Promise<Partial<GoogleFitActivityData>> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = now.getTime();

  const body = {
    aggregateBy: [
      { dataTypeName: 'com.google.step_count.delta' },
      { dataTypeName: 'com.google.calories.expended' },
      { dataTypeName: 'com.google.active_minutes' },
      { dataTypeName: 'com.google.distance.delta' },
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startOfDay,
    endTimeMillis: endOfDay,
  };

  const response = await fetch('https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Fit API error:', response.status, errorText);
    throw new Error(`Erreur Google Fit (${response.status}) : ${errorText}`);
  }

  const data = await response.json();
  let steps = 0;
  let calories = 0;
  let activeMinutes = 0;
  let distanceMeters = 0;

  if (data.bucket && data.bucket.length > 0) {
    const bucket = data.bucket[0];
    if (bucket.dataset) {
      for (const dataset of bucket.dataset) {
        const streamId = dataset.dataSourceId || '';
        const dataTypeName = dataset.dataTypeName || '';

        for (const point of dataset.point || []) {
          for (const val of point.value || []) {
            if (dataTypeName.includes('step') || streamId.includes('step')) {
              steps += val.intVal || val.fpVal || 0;
            } else if (dataTypeName.includes('calories') || streamId.includes('calories')) {
              calories += Math.round(val.fpVal || val.intVal || 0);
            } else if (dataTypeName.includes('active_minutes') || streamId.includes('active_minutes')) {
              activeMinutes += val.intVal || Math.round(val.fpVal || 0);
            } else if (dataTypeName.includes('distance') || streamId.includes('distance')) {
              distanceMeters += Math.round(val.fpVal || val.intVal || 0);
            }
          }
        }
      }
    }
  }

  return {
    steps,
    activeCalories: calories,
    activeMinutes,
    distanceMeters,
    lastSync: Date.now(),
    isConnected: true,
  };
}
