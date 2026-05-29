const thisWeek = () => {
  const today = new Date();
  const Jan1 = new Date(today.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((today - Jan1) / (1000 * 60 * 60 * 24));
  const result = Math.ceil((today.getDay() + 1 + numberOfDays) / 7);
  return result - 1;
};

export default { thisWeek };
