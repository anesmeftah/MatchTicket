import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Matches } from './matches';

describe('Matches', () => {
  let component: Matches;
  let fixture: ComponentFixture<Matches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Matches]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Matches);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
