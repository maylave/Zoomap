

export interface Ticket {
  id: string | number; 
  name: string;
  price: number;
}

export interface SelectedTicket {
  ticket: Ticket;
  count: number;
}


export interface AddTicketsPayload {
  tickets: SelectedTicket[];
  
}

export interface OrderResponse {
  success: boolean;
  orderId: string;
  totalAmount: number;
  message?: string;
}