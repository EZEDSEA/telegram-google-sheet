import { rethrow } from '@nestjs/core/helpers/rethrow';

const minList = {
  RUB: 100000,
  USD: 5000,
  EUR: 5000,
};

export const min = (amount, currency) => {
  const min = minList[currency] || 1;
  const isBigger = amount >= min;
  return { min, isBigger };
};

export const calcAmo = (amount: number, currencies, mainIdx) => {
  const some = [];
  const second = 1 - mainIdx;
  const rate = 1.5;
  some[mainIdx] = amount;
  some[second] = amount * rate;
  return some;
};

export const getCurrency = (from, to) => {
  return ['USD', 'RUB', 'BTC', 'ETH', 'USDT'];
};
