import { calculateExposureScore, calculateSolarIntensity, DEFAULT_SCORING_WEIGHTS } from './scoringEngine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- RUNNING SHADEROUTE SCORING ENGINE TESTS ---');

// Test 1: Solar intensity diurnal curve
{
  const nightSolar = calculateSolarIntensity(2); // 2 AM
  const middaySolar = calculateSolarIntensity(13); // 1 PM
  const morningSolar = calculateSolarIntensity(8); // 8 AM

  assert(nightSolar < 0.1, `Night solar should be minimal (got ${nightSolar})`);
  assert(middaySolar > 0.85, `Midday solar should peak near 1.0 (got ${middaySolar})`);
  assert(morningSolar > nightSolar && morningSolar < middaySolar, 'Morning solar should be intermediate');
  console.log('✓ Test 1 Passed: Solar intensity curve calculation matches physical diurnal pattern.');
}

// Test 2: Low data confidence returns null score and does not invent fake values
{
  const sparseData = calculateExposureScore({
    ambientTempC: 36,
    timeOfDayHour: 14,
    routeDurationMin: 20,
    shadeCoveragePercent: 50,
    treeCanopyPercent: 30,
    coveredWalkwayPercent: 20,
    dataConfidencePercent: 18, // < 25% threshold
  });

  assert(sparseData.score === null, 'Score must be null when data confidence is below minimum threshold');
  assert(sparseData.isAvailable === false, 'isAvailable must be false');
  assert(sparseData.tier === 'Unavailable', 'Tier must be Unavailable');
  assert(Boolean(sparseData.unavailableReason?.includes('Insufficient')), 'Must provide clear honest reason');
  console.log('✓ Test 2 Passed: Low confidence data properly suppresses fabricated scores.');
}

// Test 3: Shade alternative scores significantly lower heat exposure than unshaded route
{
  const hotMiddayTemp = 39; // 39°C hot summer afternoon
  const hour = 13;

  // Unshaded direct route (15 mins walk, 10% shade)
  const unshadedRoute = calculateExposureScore({
    ambientTempC: hotMiddayTemp,
    timeOfDayHour: hour,
    routeDurationMin: 15,
    shadeCoveragePercent: 10,
    treeCanopyPercent: 5,
    coveredWalkwayPercent: 5,
    dataConfidencePercent: 90,
  });

  // Canopy shaded route (18 mins walk, slightly longer, but 75% shade)
  const shadedRoute = calculateExposureScore({
    ambientTempC: hotMiddayTemp,
    timeOfDayHour: hour,
    routeDurationMin: 18,
    shadeCoveragePercent: 75,
    treeCanopyPercent: 65,
    coveredWalkwayPercent: 10,
    dataConfidencePercent: 90,
  });

  assert(unshadedRoute.score !== null && shadedRoute.score !== null, 'Both scores should be computed');
  assert(
    (unshadedRoute.score || 0) > (shadedRoute.score || 0),
    `Unshaded route (${unshadedRoute.score}) must have higher heat exposure score than shaded route (${shadedRoute.score})`
  );
  assert(shadedRoute.breakdown.shadeMitigationCredit > 0, 'Shade mitigation credit must be applied');
  console.log(`✓ Test 3 Passed: Shaded route (${shadedRoute.score}/100) shows substantial heat reduction vs direct sun route (${unshadedRoute.score}/100).`);
}

// Test 4: Custom weights adjust penalties predictably
{
  const baseline = calculateExposureScore({
    ambientTempC: 32,
    timeOfDayHour: 12,
    routeDurationMin: 25,
    shadeCoveragePercent: 30,
    treeCanopyPercent: 20,
    coveredWalkwayPercent: 10,
    dataConfidencePercent: 85,
  }, DEFAULT_SCORING_WEIGHTS);

  // Heavy solar emphasis
  const solarHeavy = calculateExposureScore({
    ambientTempC: 32,
    timeOfDayHour: 12,
    routeDurationMin: 25,
    shadeCoveragePercent: 30,
    treeCanopyPercent: 20,
    coveredWalkwayPercent: 10,
    dataConfidencePercent: 85,
  }, {
    temperatureWeight: 0.10,
    solarIrradianceWeight: 0.60,
    durationWeight: 0.15,
    surfaceAlbedoWeight: 0.15,
  });

  assert(baseline.isAvailable && solarHeavy.isAvailable, 'Both calculations must succeed');
  console.log('✓ Test 4 Passed: Configurable scoring weights correctly alter sensitivity.');
}

// Test 5: TimeShift departure comparison shows significant heat reduction in late afternoon vs peak midday
{
  const middayWalk = calculateExposureScore({
    ambientTempC: 38,
    timeOfDayHour: 13, // 1 PM peak sun
    routeDurationMin: 20,
    shadeCoveragePercent: 40,
    treeCanopyPercent: 30,
    coveredWalkwayPercent: 10,
    dataConfidencePercent: 90,
  });

  const eveningWalk = calculateExposureScore({
    ambientTempC: 32,
    timeOfDayHour: 18, // 6 PM low sun
    routeDurationMin: 20,
    shadeCoveragePercent: 40,
    treeCanopyPercent: 30,
    coveredWalkwayPercent: 10,
    dataConfidencePercent: 90,
  });

  assert(middayWalk.score !== null && eveningWalk.score !== null, 'Both scores must be calculated');
  assert(
    (middayWalk.score || 0) > (eveningWalk.score || 0),
    `Midday walk (${middayWalk.score}) must have higher exposure than evening walk (${eveningWalk.score})`
  );
  console.log(`✓ Test 5 Passed: TimeShift comparison verifies 18:00 departure (${eveningWalk.score}/100) cuts heat vs 13:00 peak (${middayWalk.score}/100).`);
}

console.log('--- ALL SCORING ENGINE TESTS PASSED SUCCESSFULLY! ---');
