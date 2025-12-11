export interface Ticket {
  id: number;
  event: string;
  date: string;
  seat: string;
  section?: string;
  row_number?: number;
  seat_number?: number;
  price: number;
  status: string;
  match_id?: number;
}