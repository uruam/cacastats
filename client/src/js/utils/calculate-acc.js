const calculateAcc = (weapon) => {
  const { shots, hits } = weapon;
  const acc = Math.round((hits * 100) / (shots || hits)) || 0;

  return acc;
};

export default calculateAcc;
