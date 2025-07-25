export type User = {
  id: string;
  fullName: string;
  email: string;
  location: string;
  city: string;
  address: string;
  country: string;
  continent: string;
  language: string;
  countryCode: string;
  favoriteGame: string;
  birthMonth: string;
  birthYear: number;
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
  jobTitle: string;
  salary: number;
  hireDate: string;
  phoneNumber: string;
  teamName: string;
  performanceScore: number;
  otherCountries: User[];
};

// Seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed || Math.floor(Math.random() * 1000000);
  }

  // Generate a random number between 0 and 1
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Get a random integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Get a random element from an array
  pickFrom<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

export function generateTableData({
  maxRows,
  levels,
  parentId,
  numRowsRef = { val: 0 },
  localRows = maxRows,
  seed,
}: {
  maxRows: number;
  levels?: number;
  parentId?: string;
  localRows?: number;
  numRowsRef?: { val: number };
  seed?: number;
}): User[] {
  // Create a seeded random generator
  const random = new SeededRandom(seed);

  if (numRowsRef.val > maxRows) {
    return [];
  }

  // Cities mapped to countries
  const citiesByCountry: Record<string, string[]> = {
    "Ireland": ["Dublin", "Cork", "Galway", "Limerick", "Waterford"],
    "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao"],
    "United Kingdom": ["London", "Manchester", "Edinburgh", "Glasgow", "Liverpool"],
    "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],
    "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
    "Sweden": ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Linköping"],
    "Italy": ["Rome", "Milan", "Naples", "Turin", "Florence"],
    "Greece": ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa"],
    "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"],
    "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata"],
  };

  // Street types
  const streetTypes = ["Street", "Avenue", "Boulevard", "Road", "Lane", "Drive", "Way", "Place", "Court"];
  
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
    "Noah",
    "Liam",
    "Emma",
    "Oliver",
    "Charlotte",
    "Elijah",
    "Amelia",
    "James",
    "Mia",
    "William"
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
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Wilson"
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

  const jobTitles = [
    "Software Engineer",
    "Data Analyst",
    "Product Manager",
    "UX Designer",
    "Marketing Specialist",
    "Sales Representative",
    "HR Coordinator",
    "Financial Analyst",
    "Operations Manager",
    "Customer Success Manager",
    "QA Engineer",
    "DevOps Engineer",
    "Content Strategist",
    "Account Executive",
    "Project Manager"
  ];

  const teamNames = [
    "Alpha",
    "Innovators",
    "Trailblazers",
    "Phoenix",
    "Titans",
    "Quantum",
    "Falcon",
    "Venture",
    "Horizon",
    "Velocity"
  ];

  const data = [];
  let i = 0;
  for (; numRowsRef.val < maxRows && i < localRows; ) {
    const countryInfo = random.pickFrom(countries);
    const id = `${i}-${parentId ? `${parentId}.` : ""}${i + 1}`;
    i += 1;
    numRowsRef.val += 1;
    
    const firstName = random.pickFrom(firstNames);
    const lastName = random.pickFrom(lastNames);
    const country = countryInfo.country;
    const city = random.pickFrom(citiesByCountry[country]);
    const streetNumber = random.nextInt(1, 999);
    const streetName = random.pickFrom([
      "Oak", "Maple", "Pine", "Cedar", "Elm", "Willow", "Birch", "Walnut", 
      "Main", "High", "Park", "Mill", "Church", "School", "Lake", "River"
    ]);
    const streetType = random.pickFrom(streetTypes);
    const address = `${streetNumber} ${streetName} ${streetType}`;
    const domain = random.pickFrom(["example.com", "mail.co", "testdata.org", "mockup.net", "demo.io"]);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    const birthYear = random.nextInt(1970, 2000);
    
    const department = random.pickFrom([
      "Engineering",
      "Marketing",
      "Finance",
      "HR",
      "Sales",
      "Product",
      "Customer Support",
      "Operations",
      "Legal",
      "Research"
    ]);
    
    const jobTitle = random.pickFrom(jobTitles);
    const teamName = random.pickFrom(teamNames);
    
    // Generate phone number
    const areaCode = random.nextInt(100, 999);
    const prefix = random.nextInt(100, 999);
    const lineNumber = random.nextInt(1000, 9999);
    const phoneNumber = `+1-${areaCode}-${prefix}-${lineNumber}`;
    
    // Generate hire date
    const hireYear = random.nextInt(2015, 2023);
    const hireMonth = random.nextInt(1, 12);
    const hireDay = random.nextInt(1, 28);
    const hireDate = `${hireYear}-${hireMonth.toString().padStart(2, '0')}-${hireDay.toString().padStart(2, '0')}`;
    
    const performanceScore = random.nextInt(1, 5);
    const salary = random.nextInt(50000, 200000);
    
    const otherCountries =
      levels === 0
        ? []
        : generateTableData({
            numRowsRef,
            maxRows,
            localRows: random.nextInt(0, 5),
            levels: levels ? levels - 1 : random.nextInt(1, 3),
            parentId: id,
            seed: random.nextInt(1, 1000000), // Generate a new seed for child data
          });
          
    data.push({
      id,
      fullName: `${firstName} ${lastName}`,
      email,
      location: `${city}, ${country}`,
      city,
      address,
      country: countryInfo.country,
      continent: countryInfo.continent,
      language: countryInfo.language,
      countryCode: countryCodes[countryInfo.country],
      favoriteGame: random.pickFrom(games),
      birthMonth: random.pickFrom(months),
      birthYear,
      isActive: random.next() > 0.5,
      yearlyWinnings: {
        2019: random.nextInt(1000, 5000),
        2020: random.nextInt(1000, 5000),
        2021: random.nextInt(1000, 5000),
        2022: random.nextInt(1000, 5000),
        2023: random.nextInt(1000, 5000),
        2024: random.nextInt(1000, 5000),
      },
      experienceYears: random.nextInt(1, 20),
      rating: random.nextInt(1, 10),
      completedProjects: random.nextInt(0, 50),
      department,
      jobTitle,
      salary,
      hireDate,
      phoneNumber,
      teamName,
      performanceScore,
      otherCountries,
    });
  }

  return data;
}
