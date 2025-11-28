import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsCards } from './statistics-cards';

describe('StatisticsCards', () => {
  let component: StatisticsCards;
  let fixture: ComponentFixture<StatisticsCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatisticsCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
