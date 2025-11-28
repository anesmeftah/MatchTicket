import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsTable } from './tickets-table';

describe('TicketsTable', () => {
  let component: TicketsTable;
  let fixture: ComponentFixture<TicketsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
