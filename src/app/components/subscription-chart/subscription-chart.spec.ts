import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubscriptionChart } from './subscription-chart';

describe('SubscriptionChart', () => {
  let component: SubscriptionChart;
  let fixture: ComponentFixture<SubscriptionChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionChart]
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionChart);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
