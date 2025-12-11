import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketUser } from './ticket-user';

describe('TicketUser', () => {
  let component: TicketUser;
  let fixture: ComponentFixture<TicketUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
