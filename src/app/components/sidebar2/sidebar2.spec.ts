import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sidebar2 } from './sidebar2';

describe('Sidebar2', () => {
  let component: Sidebar2;
  let fixture: ComponentFixture<Sidebar2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sidebar2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
