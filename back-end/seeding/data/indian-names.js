/**
 * Indian Names Data
 */

export const indianFirstNames = {
  male: [
    'Rajesh', 'Amit', 'Suresh', 'Vijay', 'Anil', 'Rahul', 'Sanjay', 'Ravi',
    'Ashok', 'Manoj', 'Prakash', 'Deepak', 'Ramesh', 'Kiran', 'Vishal',
    'Arun', 'Pankaj', 'Nitin', 'Sachin', 'Rohan', 'Arjun', 'Naveen',
    'Sandeep', 'Vivek', 'Mahesh', 'Ankit', 'Gaurav', 'Varun', 'Nikhil', 'Pradeep'
  ],
  female: [
    'Priya', 'Anjali', 'Kavita', 'Sunita', 'Pooja', 'Rekha', 'Meera', 'Neha',
    'Smita', 'Asha', 'Divya', 'Sneha', 'Swati', 'Ritu', 'Shalini',
    'Anita', 'Seema', 'Madhuri', 'Nisha', 'Sapna', 'Geeta', 'Usha',
    'Shruti', 'Deepika', 'Aisha', 'Riya', 'Simran', 'Tanvi', 'Aditi', 'Jyoti'
  ]
};

export const indianLastNames = [
  'Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Nair', 'Iyer',
  'Gupta', 'Joshi', 'Rao', 'Menon', 'Chatterjee', 'Mukherjee', 'Das',
  'Agarwal', 'Mishra', 'Pandey', 'Kapoor', 'Mehta', 'Shah', 'Desai',
  'Kulkarni', 'Jain', 'Malhotra', 'Bhatia', 'Arora', 'Khanna', 'Chopra', 'Saxena'
];

export const indianCities = [
  { city: 'Mumbai', state: 'Maharashtra', zipPrefix: '400' },
  { city: 'Delhi', state: 'Delhi', zipPrefix: '110' },
  { city: 'Bangalore', state: 'Karnataka', zipPrefix: '560' },
  { city: 'Hyderabad', state: 'Telangana', zipPrefix: '500' },
  { city: 'Chennai', state: 'Tamil Nadu', zipPrefix: '600' },
  { city: 'Kolkata', state: 'West Bengal', zipPrefix: '700' },
  { city: 'Pune', state: 'Maharashtra', zipPrefix: '411' },
  { city: 'Ahmedabad', state: 'Gujarat', zipPrefix: '380' },
  { city: 'Jaipur', state: 'Rajasthan', zipPrefix: '302' },
  { city: 'Lucknow', state: 'Uttar Pradesh', zipPrefix: '226' },
  { city: 'Chandigarh', state: 'Chandigarh', zipPrefix: '160' },
  { city: 'Kochi', state: 'Kerala', zipPrefix: '682' },
  { city: 'Indore', state: 'Madhya Pradesh', zipPrefix: '452' },
  { city: 'Coimbatore', state: 'Tamil Nadu', zipPrefix: '641' },
  { city: 'Vizag', state: 'Andhra Pradesh', zipPrefix: '530' }
];

export const indianStreets = [
  'MG Road', 'Brigade Road', 'Commercial Street', 'Residency Road',
  'Nehru Nagar', 'Gandhi Nagar', 'Patel Nagar', 'Lajpat Nagar',
  'Koramangala', 'Indiranagar', 'Jayanagar', 'Malleswaram',
  'Jubilee Hills', 'Banjara Hills', 'Hitech City', 'Madhapur',
  'Anna Nagar', 'T Nagar', 'Adyar', 'Velachery',
  'Park Street', 'Salt Lake', 'Ballygunge', 'Alipore'
];

export function getRandomIndianName(gender = null) {
  const genderType = gender || (Math.random() > 0.5 ? 'male' : 'female');
  const firstNames = indianFirstNames[genderType];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
  return `${firstName} ${lastName}`;
}

export function getRandomIndianAddress() {
  const location = indianCities[Math.floor(Math.random() * indianCities.length)];
  const street = indianStreets[Math.floor(Math.random() * indianStreets.length)];
  const buildingNo = Math.floor(Math.random() * 999) + 1;
  const flatNo = Math.floor(Math.random() * 50) + 1;
  
  return {
    street: `Flat ${flatNo}, ${buildingNo} ${street}`,
    city: location.city,
    state: location.state,
    zipCode: `${location.zipPrefix}${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
    country: 'India'
  };
}

export function getRandomIndianPhone() {
  const operators = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  const number = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
  return `+91${operator}${number}`;
}
