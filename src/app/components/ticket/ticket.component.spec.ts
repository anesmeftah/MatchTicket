import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketComponent } from './ticket.component';

describe('TicketComponent', () => {
  let component: TicketComponent;
  let fixture: ComponentFixture<TicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load available tickets on init', () => {
    expect(component.availableTickets).toBeDefined();
  });

  it('should load user tickets for current user', () => {
    expect(component.userTickets).toBeDefined();
  });

  it('should format price correctly', () => {
    expect(component.formatPrice(100)).toBe('100.00');
    expect(component.formatPrice('99.5')).toBe('99.50');
  });

  it('should format date correctly', () => {
    const date = '2024-12-25';
    const formatted = component.formatDate(date);
    expect(formatted).toBeTruthy();
  });

  it('should open buy modal', () => {
    const ticket: any = {
      id: 1,
      event: 'Test Event',
      date: '2024-12-25',
      seat: 'A1',
      price: 50
    };
    component.openBuyModal(ticket);
    expect(component.showModal).toBe(true);
    expect(component.selectedTicket).toBe(ticket);
  });

  it('should close buy modal', () => {
    component.showModal = true;
    component.closeModal();
    expect(component.showModal).toBe(false);
    expect(component.selectedTicket).toBeNull();
  });
});
