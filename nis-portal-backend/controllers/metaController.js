// Simple metadata controller returning static lists for countries and benefit types.
exports.getCountries = async (req, res) => {
  // In a real app these would come from the database.
  const countries = [
    { id: 1, name: 'Barbados - National Insurance Board' },
    { id: 2, name: 'Jamaica - National Insurance Scheme' },
    { id: 3, name: 'Trinidad & Tobago - National Insurance Board' },
    { id: 4, name: 'St. Lucia - National Insurance Corporation' },
    { id: 5, name: 'Grenada - National Insurance Scheme' },
    { id: 6, name: 'Belize - Social Security Board' },
    { id: 7, name: 'Antigua & Barbuda - Social Security Board' },
  ];
  res.json(countries);
};

exports.getBenefitTypes = async (req, res) => {
  const benefits = [
    { id: 1, name: 'Old Age Pension' },
    { id: 2, name: 'Survivors Benefit' },
    { id: 3, name: 'Invalidity Benefit' },
    { id: 4, name: 'Other' },
  ];
  res.json(benefits);
};
