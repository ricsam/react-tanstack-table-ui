export type User = {
  id: number;
  fullName: string;
  location: string;
  country: string;
  continent: string;
  language: string;
  countryCode: string;
  favoriteGame: string;
  birthMonth: string;
  isActive: boolean;
  yearlyWinnings: {
    2019: number;
    2020: number;
    2021: number;
    2022: number;
    2023: number;
    2024: number;
  };
  experienceYears: number;
  rating: number;
  completedProjects: number;
  department: string;
};

export function generateTableData(rowCount: number): User[] {
  const locations = [
    "Station",
    "Railway",
    "Street",
    "Address",
    "Toy",
    "Soft Box",
    "Make and Model",
    "Longest Day",
    "Shortest Night",
  ];
  const countries = [
    { country: "Ireland", continent: "Europe", language: "English" },
    { country: "Spain", continent: "Europe", language: "Spanish" },
    { country: "United Kingdom", continent: "Europe", language: "English" },
    { country: "France", continent: "Europe", language: "French" },
    { country: "Germany", continent: "Europe", language: "German" },
    { country: "Sweden", continent: "Europe", language: "Swedish" },
    { country: "Italy", continent: "Europe", language: "Italian" },
    { country: "Greece", continent: "Europe", language: "Greek" },
    { country: "Brazil", continent: "South America", language: "Portuguese" },
    { country: "Argentina", continent: "South America", language: "Spanish" },
  ];
  const countryCodes: Record<string, string> = {
    Ireland: "ie",
    Spain: "es",
    "United Kingdom": "gb",
    France: "fr",
    Germany: "de",
    Sweden: "se",
    Italy: "it",
    Greece: "gr",
    Brazil: "br",
    Argentina: "ar",
  };
  const games = [
    "Chess",
    "Backgammon",
    "Checkers",
    "Othello",
    "Stratego",
    "Go",
    "Gipf",
    "Senet",
    "Shogi",
    "Xiangqi",
  ];
  const firstNames = [
    "Tony",
    "Andrew",
    "Kevin",
    "Sophie",
    "Isabelle",
    "Emily",
    "Olivia",
    "Lily",
    "Jessica",
    "Ava",
  ];
  const lastNames = [
    "Smith",
    "Connell",
    "Flanagan",
    "Black",
    "Beckham",
    "Brennan",
    "Brock",
    "Fisher",
    "Grady",
    "Hunter",
  ];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
  function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const data = [];
  for (let i = 0; i < rowCount; i++) {
    const countryInfo = getRandomElement(countries);
    data.push({
      id: i + 1,
      fullName: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
      location: `${getRandomElement(locations)} in ${countryInfo.country}`,
      country: countryInfo.country,
      continent: countryInfo.continent,
      language: countryInfo.language,
      countryCode: countryCodes[countryInfo.country],
      favoriteGame: getRandomElement(games),
      birthMonth: getRandomElement(months),
      isActive: Math.random() > 0.5,
      yearlyWinnings: {
        2019: getRandomNumber(1000, 5000),
        2020: getRandomNumber(1000, 5000),
        2021: getRandomNumber(1000, 5000),
        2022: getRandomNumber(1000, 5000),
        2023: getRandomNumber(1000, 5000),
        2024: getRandomNumber(1000, 5000),
      },
      experienceYears: getRandomNumber(1, 20),
      rating: getRandomNumber(1, 10),
      completedProjects: getRandomNumber(0, 50),
      department: getRandomElement([
        "Engineering",
        "Marketing",
        "Finance",
        "HR",
        "Sales",
      ]),
    });
  }

  return data;
}
