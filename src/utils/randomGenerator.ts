/**
 * 使用加密级随机数生成器生成随机整数
 * 确保在指定范围内均匀分布
 */
export function getRandomInt(min: number, max: number): number {
  if (min > max) {
    throw new Error('min must be less than or equal to max');
  }

  const range = max - min + 1;
  const maxValid = Math.floor(Number.MAX_SAFE_INTEGER / range) * range - 1;

  let randomValue: number;
  do {
    // 使用 crypto.getRandomValues 生成加密级随机数
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    randomValue = array[0];
  } while (randomValue > maxValid);

  return min + (randomValue % range);
}

/**
 * 从数组中随机选择一个元素
 */
export function getRandomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot get random element from empty array');
  }
  const index = getRandomInt(0, array.length - 1);
  return array[index];
}

