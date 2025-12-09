import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppHistogram } from './app-histogram';

describe('AppHistogram', () => {
  let component: AppHistogram;
  let fixture: ComponentFixture<AppHistogram>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHistogram]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppHistogram);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
