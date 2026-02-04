/**
 * Indian Electronic Products Data
 */

export const electronicProducts = [
  // Smartphones
  { name: 'Samsung Galaxy S23 Ultra', category: 'Smartphone', price: 124999, brand: 'Samsung' },
  { name: 'iPhone 15 Pro Max', category: 'Smartphone', price: 159999, brand: 'Apple' },
  { name: 'OnePlus 12', category: 'Smartphone', price: 64999, brand: 'OnePlus' },
  { name: 'Xiaomi 14 Pro', category: 'Smartphone', price: 54999, brand: 'Xiaomi' },
  { name: 'Vivo X100 Pro', category: 'Smartphone', price: 89999, brand: 'Vivo' },
  { name: 'Realme GT 5', category: 'Smartphone', price: 39999, brand: 'Realme' },
  { name: 'Google Pixel 8 Pro', category: 'Smartphone', price: 106999, brand: 'Google' },
  { name: 'Oppo Find X7', category: 'Smartphone', price: 69999, brand: 'Oppo' },
  
  // Laptops
  { name: 'Dell XPS 15', category: 'Laptop', price: 145999, brand: 'Dell' },
  { name: 'HP Pavilion Gaming', category: 'Laptop', price: 79999, brand: 'HP' },
  { name: 'Lenovo ThinkPad X1', category: 'Laptop', price: 129999, brand: 'Lenovo' },
  { name: 'Asus ROG Strix G15', category: 'Laptop', price: 119999, brand: 'Asus' },
  { name: 'MacBook Air M3', category: 'Laptop', price: 114999, brand: 'Apple' },
  { name: 'Acer Predator Helios', category: 'Laptop', price: 99999, brand: 'Acer' },
  
  // Tablets
  { name: 'iPad Pro 12.9"', category: 'Tablet', price: 112999, brand: 'Apple' },
  { name: 'Samsung Galaxy Tab S9', category: 'Tablet', price: 76999, brand: 'Samsung' },
  { name: 'Lenovo Tab P12', category: 'Tablet', price: 45999, brand: 'Lenovo' },
  
  // Headphones & Earbuds
  { name: 'Sony WH-1000XM5', category: 'Headphones', price: 29990, brand: 'Sony' },
  { name: 'Apple AirPods Pro 2', category: 'Earbuds', price: 26999, brand: 'Apple' },
  { name: 'Boat Airdopes 800', category: 'Earbuds', price: 2999, brand: 'Boat' },
  { name: 'JBL Live 660NC', category: 'Headphones', price: 9999, brand: 'JBL' },
  { name: 'Bose QuietComfort 45', category: 'Headphones', price: 32999, brand: 'Bose' },
  { name: 'Noise Buds VS104', category: 'Earbuds', price: 1499, brand: 'Noise' },
  
  // Smartwatches
  { name: 'Apple Watch Series 9', category: 'Smartwatch', price: 45999, brand: 'Apple' },
  { name: 'Samsung Galaxy Watch 6', category: 'Smartwatch', price: 31999, brand: 'Samsung' },
  { name: 'Noise ColorFit Pro 5', category: 'Smartwatch', price: 3999, brand: 'Noise' },
  { name: 'Amazfit GTR 4', category: 'Smartwatch', price: 17999, brand: 'Amazfit' },
  { name: 'Fire-Boltt Phoenix Ultra', category: 'Smartwatch', price: 4999, brand: 'Fire-Boltt' },
  
  // TVs
  { name: 'Sony Bravia X90L 65"', category: 'Television', price: 149999, brand: 'Sony' },
  { name: 'Samsung Neo QLED 55"', category: 'Television', price: 119999, brand: 'Samsung' },
  { name: 'LG OLED C3 55"', category: 'Television', price: 134999, brand: 'LG' },
  { name: 'Mi TV 5X 55"', category: 'Television', price: 44999, brand: 'Xiaomi' },
  { name: 'OnePlus Y1S Pro 55"', category: 'Television', price: 39999, brand: 'OnePlus' },
  
  // Cameras
  { name: 'Canon EOS R6 Mark II', category: 'Camera', price: 249999, brand: 'Canon' },
  { name: 'Nikon Z8', category: 'Camera', price: 329999, brand: 'Nikon' },
  { name: 'Sony Alpha A7 IV', category: 'Camera', price: 224999, brand: 'Sony' },
  { name: 'GoPro Hero 12 Black', category: 'Action Camera', price: 44999, brand: 'GoPro' },
  
  // Gaming
  { name: 'PlayStation 5', category: 'Gaming Console', price: 54999, brand: 'Sony' },
  { name: 'Xbox Series X', category: 'Gaming Console', price: 52999, brand: 'Microsoft' },
  { name: 'Nintendo Switch OLED', category: 'Gaming Console', price: 34999, brand: 'Nintendo' },
  
  // Accessories
  { name: 'Logitech MX Master 3S', category: 'Mouse', price: 9999, brand: 'Logitech' },
  { name: 'Keychron K8 Pro', category: 'Keyboard', price: 8999, brand: 'Keychron' },
  { name: 'SanDisk Extreme Pro 1TB', category: 'SSD', price: 12999, brand: 'SanDisk' },
  { name: 'Seagate Backup Plus 2TB', category: 'HDD', price: 6999, brand: 'Seagate' },
  { name: 'Anker PowerCore 20000mAh', category: 'Power Bank', price: 3999, brand: 'Anker' },
  { name: 'TP-Link Archer AX73', category: 'Router', price: 9999, brand: 'TP-Link' }
];

export function getRandomProducts(count) {
  const shuffled = [...electronicProducts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, electronicProducts.length));
}

export function getRandomProduct() {
  return electronicProducts[Math.floor(Math.random() * electronicProducts.length)];
}

export function generateSKU(productName) {
  const words = productName.split(' ');
  const prefix = words.map(w => w.charAt(0).toUpperCase()).join('').substring(0, 3);
  const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${prefix}-${suffix}`;
}
