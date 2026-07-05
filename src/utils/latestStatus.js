import { getMeasurementsByToddler, getMeasurementDetail } from '../api/measurements'

// The measurements list endpoint does not include weight_status/length_status
// (only the single-measurement detail endpoint does). To show a status badge
// per toddler in lists, we look up the most recent measurement, then fetch
// its detail. This is a best-effort helper: any failure resolves to `null`
// rather than throwing, so one bad lookup doesn't break the whole list.
export async function getLatestStatusForToddler(toddlerId) {
  try {
    const listRes = await getMeasurementsByToddler(toddlerId)
    const measurements = listRes.data?.data?.measurements || []
    if (measurements.length === 0) return null

    const latest = [...measurements].sort((a, b) => {
      const da = new Date(a.measurement_date || a.created_at)
      const db = new Date(b.measurement_date || b.created_at)
      return db - da
    })[0]

    const detailRes = await getMeasurementDetail(latest.id)
    const measurement = detailRes.data?.data?.measurement
    if (!measurement) return null

    return {
      weightStatus: measurement.weight_status,
      lengthStatus: measurement.length_status,
      latestMeasurement: measurement,
    }
  } catch {
    return null
  }
}
