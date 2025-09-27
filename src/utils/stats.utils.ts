/**
 * Calculates the sample standard deviation of an array of numbers.
 * Uses Bessel's correction (dividing by n - 1).
 * * @param samples The array of numeric samples.
 * @returns The sample standard deviation, or 0 if the array has 1 or fewer elements.
 */
export function calculateStandardDeviation(samples: number[]): number {
    const n = samples.length;

    // Standard deviation is only meaningful for n > 1
    if (n <= 1) {
        return 0;
    }

    // Step 1: Calculate the Mean (Average)
    const mean = samples.reduce((sum, x) => sum + x, 0) / n;

    // Step 2 & 3: Calculate the Sum of Squared Differences from the Mean (Variance numerator)
    const squaredDifferencesSum = samples.reduce((sum, x) => {
        const difference = x - mean;
        return sum + difference * difference;
    }, 0);

    // Step 4: Calculate the Sample Variance (divide by n - 1)
    const sampleVariance = squaredDifferencesSum / (n - 1);

    // Step 5: Calculate the Standard Deviation (square root of the variance)
    const standardDeviation = Math.sqrt(sampleVariance);

    return standardDeviation;
}

/**
 * Calculates the mean (average) of an array of numbers.
 * @param samples The array of numeric samples.
 * @returns The mean of the samples, or 0 if the array is empty.
 */
export function calculateMean(samples: number[]): number {
    if (samples.length === 0) {
        return 0;
    }
    const sum = samples.reduce((s, x) => s + x, 0);
    return sum / samples.length;
}