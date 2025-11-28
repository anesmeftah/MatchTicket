export interface Ticket {
  id: number;
  event: string;
  date: string;
  seat: string;
  price: number;
  status: 'available' | 'sold' | 'reserved';
}

