// All money calculations stay here. The stylist only supplies ordinary facts.
function dayMath(values) {
  const {sales, hours, pay, rate, tips, supplies, weeklyRent, workdays} = values;
  if (![sales,hours,rate,tips,supplies,weeklyRent,workdays].every(Number.isFinite) ||
      [sales,tips,supplies,weeklyRent].some(n=>n<0) || hours<=0 || rate<0 || workdays<=0 ||
      (pay==='commission' && rate>100) || !['commission','hourly','self'].includes(pay)) return null;
  const paid = pay==='commission' ? sales*rate/100 : pay==='hourly' ? hours*rate : sales;
  const rentForDay = pay==='self' ? weeklyRent/workdays : 0;
  const day = paid+tips-supplies-rentForDay;
  return {day,month:day*52/12,perHour:day/hours,rentForDay};
}
